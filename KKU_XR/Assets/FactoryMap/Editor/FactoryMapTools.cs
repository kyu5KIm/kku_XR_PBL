using UnityEditor;
using UnityEditor.SceneManagement;

public static class FactoryMapTools
{
    [MenuItem("Tools/Factory Map/Open Factory Scene")]
    public static void Open()
    {
        if (EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo())
            EditorSceneManager.OpenScene("Assets/FactoryMap/FactoryMap_36x24.unity");
    }
}
