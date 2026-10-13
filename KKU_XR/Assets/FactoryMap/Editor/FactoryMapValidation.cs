using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.ProBuilder;
using UnityEditor;
using UnityEditor.SceneManagement;

/// <summary>Validates the saved factory scene, without saving temporary test objects.</summary>
public static class FactoryMapValidation
{
    const string ScenePath = "Assets/FactoryMap/FactoryMap_36x24.unity";
    static readonly List<string> lines = new List<string>();

    [MenuItem("Tools/Factory Map/Validate Saved Factory")]
    public static void ValidateSavedFactory()
    {
        if (EditorApplication.isPlaying) throw new InvalidOperationException("Exit Play Mode before validation.");
        var scene = UnityEngine.SceneManagement.SceneManager.GetSceneByPath(ScenePath);
        bool alreadyLoaded = scene.IsValid() && scene.isLoaded;
        if (!alreadyLoaded) scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Additive);
        try { Validate(scene.GetRootGameObjects()); }
        finally { if (!alreadyLoaded) EditorSceneManager.CloseScene(scene, true); }
    }

    public static void ValidateBatch()
    {
        try
        {
            var scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            Validate(scene.GetRootGameObjects());
            EditorApplication.Exit(0);
        }
        catch (Exception error)
        {
            Debug.LogError("FACTORY_VALIDATION_FAILED: " + error.Message);
            EditorApplication.Exit(1);
        }
    }

    static void Validate(GameObject[] roots)
    {
        lines.Clear();
        Log("UNITY_VERSION=" + Application.unityVersion);
        var map = roots.Single(g => g.name == "FactoryMap_36x24_PDF");
        var meshes = map.GetComponentsInChildren<ProBuilderMesh>(true);
        Require(meshes.Length == 373, "Expected 373 ProBuilder meshes");
        Require(meshes.All(m => m.GetComponent<MeshFilter>().sharedMesh != null && m.GetComponent<MeshFilter>().sharedMesh.vertexCount > 0), "Missing or empty mesh");
        Require(meshes.All(m => m.GetComponent<MeshRenderer>().sharedMaterials.All(a => a != null && a.shader != null)), "Missing material or shader");
        Require(meshes.All(m => (m.transform.localScale - Vector3.one).sqrMagnitude < .0001f), "Non-unit mesh scale");
        Require(roots.SelectMany(r => r.GetComponentsInChildren<Transform>(true)).All(t => GameObjectUtility.GetMonoBehavioursWithMissingScriptCount(t.gameObject) == 0), "Missing script reference");
        Log("FACTORY_ASSETS_PASS | ProBuilderMeshes=373 | MissingMeshes=0 | MissingMaterials=0 | MissingScripts=0");
        var floor = map.GetComponentsInChildren<Transform>().Single(t => t.name == "Floor_36x24");
        Require(Vector3.Distance(floor.position, new Vector3(18, -.1f, 12)) < .001f, "Floor position differs from plan");
        Require(Vector3.Distance(floor.GetComponent<BoxCollider>().size, new Vector3(36, .2f, 24)) < .001f, "Floor dimensions differ from plan");
        Require(map.GetComponentsInChildren<Transform>().Count(t => t.name.StartsWith("A0") && t.name.EndsWith("_Assembly")) == 6, "Assembly workstation count");
        var belt = map.GetComponentsInChildren<Transform>().Single(t => t.name == "Belt");
        Require(Mathf.Abs(belt.GetComponent<BoxCollider>().size.x - 24f) < .001f, "Conveyor length differs from plan");
        Log("FACTORY_LAYOUT_PASS | Floor=36x24m | Conveyor=24m | AssemblyStations=6");
        Require(EditorBuildSettings.scenes.Length > 0 && EditorBuildSettings.scenes[0].path == ScenePath && EditorBuildSettings.scenes[0].enabled, "Factory must be the first enabled build scene");
        var player = roots.Single(g => g.name == "FactoryFirstPersonPlayer");
        var motor = player.GetComponent<FactoryFirstPersonController>();
        Require(motor != null && motor.View != null, "First-person controller or view missing");
        Require(Vector3.Distance(player.transform.position, new Vector3(18, 0, 2)) < .001f, "Unexpected spawn point");
        Require(Mathf.Abs(motor.View.localPosition.y - 1.65f) < .001f, "Eye height differs");
        Require(roots.SelectMany(r => r.GetComponentsInChildren<Camera>(true)).Count(c => c.enabled && c.gameObject.activeInHierarchy) == 1, "Expected one enabled camera");
        Require(roots.SelectMany(r => r.GetComponentsInChildren<AudioListener>(true)).Count(c => c.enabled && c.gameObject.activeInHierarchy) == 1, "Expected one enabled audio listener");
#if ENABLE_INPUT_SYSTEM
        Log("FIRST_PERSON_SETUP_PASS | Spawn=(18,0,2) | EyeHeight=1.65m | Cameras=1 | AudioListeners=1 | InputSystem=enabled");
#else
        throw new InvalidOperationException("New Input System must be enabled.");
#endif
        var test = UnityEngine.Object.Instantiate(player);
        test.name = "Temporary_FirstPerson_Validation";
        try
        {
            foreach (var camera in test.GetComponentsInChildren<Camera>()) camera.enabled = false;
            foreach (var listener in test.GetComponentsInChildren<AudioListener>()) listener.enabled = false;
            var controller = test.GetComponent<CharacterController>();
            var mover = test.GetComponent<FactoryFirstPersonController>();
            Action<Vector3> reset = position =>
            {
                controller.enabled = false;
                test.transform.position = position;
                test.transform.rotation = Quaternion.identity;
                controller.enabled = true;
                Physics.SyncTransforms();
            };
            reset(new Vector3(18, 0, 2));
            for (int i = 0; i < 10; i++) mover.MoveAndLook(Vector2.up, Vector2.zero, .1f);
            Require(Mathf.Abs(test.transform.position.z - 6f) < .15f, "Forward movement failed");
            Require(test.transform.position.y > -.1f, "Floor collision failed");
            reset(new Vector3(18, 0, 2));
            for (int i = 0; i < 10; i++) mover.MoveAndLook(Vector2.one, Vector2.zero, .1f);
            var displacement = test.transform.position - new Vector3(18, test.transform.position.y, 2);
            Require(Mathf.Abs(displacement.magnitude - 4f) < .15f, "Diagonal speed differs");
            reset(new Vector3(.7f, 0, 12));
            for (int i = 0; i < 40; i++) mover.MoveAndLook(Vector2.left, Vector2.zero, .05f);
            float wallStop = test.transform.position.x;
            Require(wallStop > .2f && wallStop < .5f, "Wall collision failed");
            reset(new Vector3(18, 0, 11));
            for (int i = 0; i < 40; i++) mover.MoveAndLook(Vector2.up, Vector2.zero, .05f);
            float conveyorStop = test.transform.position.z;
            Require(conveyorStop > 11f && conveyorStop < 11.6f, "Conveyor collision failed");
            reset(new Vector3(18, 0, 2));
            mover.MoveAndLook(Vector2.zero, new Vector2(100, 10000), .016f);
            Require(Mathf.Abs(Mathf.DeltaAngle(0, test.transform.eulerAngles.y) - 12f) < .1f, "Mouse yaw failed");
            Require(Mathf.Abs(Mathf.DeltaAngle(0, mover.View.localEulerAngles.x) + 85f) < .1f, "Pitch clamp failed");
            Log("FIRST_PERSON_MOVEMENT_PASS | Forward=4m/s | Diagonal=4m/s | MouseYaw=12deg | PitchLimit=85deg");
            Log(string.Format(System.Globalization.CultureInfo.InvariantCulture, "FIRST_PERSON_COLLISION_PASS | Floor=pass | WallStopX={0:F2} | ConveyorStopZ={1:F2}", wallStop, conveyorStop));
        }
        finally { UnityEngine.Object.DestroyImmediate(test); }
        Log("FACTORY_VALIDATION_PASS");
        string directory = Path.GetFullPath(Path.Combine(Application.dataPath, "../../docs/validation"));
        Directory.CreateDirectory(directory);
        File.WriteAllLines(Path.Combine(directory, "factory-unity-validation.log"), lines);
    }

    static void Require(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
    static void Log(string line) { lines.Add(line); Debug.Log(line); }
}
