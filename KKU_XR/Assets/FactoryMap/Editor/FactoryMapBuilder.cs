using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.ProBuilder;
using UnityEngine.Rendering;

public static class FactoryMapBuilder
{
    const string Folder = "Assets/FactoryMap";
    static Transform root;
    static Dictionary<string, Material> mats;
    static List<ProBuilderMesh> meshes;
    static Font font;
    static Vector3 V(float x,float y,float z) => new Vector3(x,y,z);

    [MenuItem("Tools/Factory Map/Create 36x24 Factory")]
    public static void Build()
    {
        // Never replace the currently open scene or any existing factory asset.
        if (AssetDatabase.LoadAssetAtPath<UnityEngine.Object>(Folder+"/FactoryMap.prefab") != null)
            throw new InvalidOperationException("FactoryMap already exists. Move the existing folder before rebuilding.");
        Directory.CreateDirectory(Folder+"/Materials");
        AssetDatabase.Refresh();
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, Application.isBatchMode ? NewSceneMode.Single : NewSceneMode.Additive);
        UnityEngine.SceneManagement.SceneManager.SetActiveScene(scene);
        root = new GameObject("FactoryMap_36x24_PDF").transform;
        meshes = new List<ProBuilderMesh>(); mats = new Dictionary<string,Material>();
        font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        Mat("Concrete",new Color(.36f,.41f,.44f)); Mat("Wall",new Color(.80f,.83f,.84f));
        Mat("Steel",new Color(.30f,.37f,.41f)); Mat("Dark",new Color(.075f,.10f,.12f));
        Mat("Bench",new Color(.65f,.75f,.80f)); Mat("Blue",new Color(.10f,.47f,.68f));
        Mat("Yellow",new Color(.98f,.72f,.13f)); Mat("Orange",new Color(.93f,.38f,.12f));
        Mat("Wood",new Color(.58f,.40f,.22f)); Mat("Carton",new Color(.69f,.52f,.32f));
        Mat("Green",new Color(.16f,.52f,.37f)); Mat("Walk",new Color(.48f,.53f,.55f));
        Mat("Storage",new Color(.38f,.49f,.37f)); Mat("Assembly",new Color(.30f,.48f,.57f));
        Mat("Test",new Color(.27f,.48f,.43f)); Mat("Inspect",new Color(.45f,.38f,.56f));
        Mat("Pack",new Color(.54f,.49f,.30f)); Mat("Rework",new Color(.61f,.36f,.25f));

        var shell = Group("01_Building");
        Box("Floor_36x24",shell,V(18,-.1f,12),V(36,.2f,24),"Concrete");
        // Outer walls lie outside the 36x24 usable floor. Door openings: G01, G02, G03.
        Box("NorthWall",shell,V(18,2,24.1f),V(36.4f,4,.2f),"Wall");
        Box("WestWall",shell,V(-.1f,2,12),V(.2f,4,24),"Wall");
        WallX(shell,"SouthWall_A",0,3); WallX(shell,"SouthWall_B",6,16.5f); WallX(shell,"SouthWall_C",19.5f,36);
        Box("G01_Inbound_Lintel",shell,V(4.5f,3.5f,-.1f),V(3,1,.2f),"Wall");
        Box("G02_Entry_Lintel",shell,V(18,3.5f,-.1f),V(3,1,.2f),"Wall");
        Box("EastWall_A",shell,V(36.1f,2,2),V(.2f,4,4),"Wall");
        Box("EastWall_B",shell,V(36.1f,2,15.5f),V(.2f,4,17),"Wall");
        Box("G03_Dispatch_Lintel",shell,V(36.1f,3.5f,5.5f),V(.2f,1,3),"Wall");
        var zones = Group("02_Zones_And_Aisles");
        Zone(zones,"C01","SOUTH AISLE",0,0,36,3,"Walk");
        Zone(zones,"C02","NORTH ACCESS",0,21,36,3,"Walk");
        Zone(zones,"C03","WEST AISLE",0,3,3,18,"Walk");
        Zone(zones,"C04","EAST AISLE",33,3,3,18,"Walk");
        Zone(zones,"Z01","INBOUND",3,3,6,6,"Storage");
        Zone(zones,"Z02","KITTING",3,9,6,6,"Storage");
        Zone(zones,"Z03","REWORK / HOLD",3,15,6,6,"Rework");
        Zone(zones,"Z04","PARTS",9,3,12,3,"Storage");
        Zone(zones,"Z05","TOOLS",21,3,6,3,"Storage");
        Zone(zones,"Z06","DISPATCH",27,3,6,6,"Storage");
        Zone(zones,"C05","SOUTH CROSS AISLE",9,6,18,3,"Walk");
        Zone(zones,"P01","ASSEMBLY",9,9,12,6,"Assembly");
        Zone(zones,"P02","AUTO TEST",21,9,4,6,"Test");
        Zone(zones,"P03","INSPECTION",25,9,4,6,"Inspect");
        Zone(zones,"P04","PACKING",29,9,4,6,"Pack");
        Zone(zones,"C06","NORTH CROSS AISLE",9,15,24,3,"Walk");
        Zone(zones,"Z07","BUFFER",9,18,12,3,"Storage");
        Zone(zones,"Z08","MAINTENANCE",21,18,12,3,"Storage");
        var equipment=Group("03_Equipment_PDF_Coordinates");
        Conveyor(equipment);
        for(int i=0;i<6;i++) Bench("A0"+(i+1)+"_Assembly",equipment,V(10+i*2,0,10.2f),1.6f,.75f);
        Bench("E03_VisualInspection",equipment,V(27,0,10.2f),2.4f,.8f);
        Bench("E04_Packing",equipment,V(31,0,10.2f),2.4f,.8f);
        Bench("R01_Rework",equipment,V(5.5f,0,18),2,.8f);
        var cabinet=Group("R02_ToolCabinet",equipment,V(7.5f,0,19.8f));
        Box("Cabinet",cabinet,V(0,.475f,0),V(.8f,.95f,.5f),"Blue");
        for(int i=0;i<4;i++) Box("DrawerHandle_"+i,cabinet,V(0,.18f+i*.2f,.26f),V(.5f,.025f,.025f),"Steel",false);
        TestCell(equipment); Rack("S01_PartsRack",equipment,V(12,0,4.5f)); Rack("S02_PartsRack",equipment,V(16,0,4.5f));
        Pallet("L01_InboundPallet",equipment,V(5,0,5.5f)); Pallet("L02_InboundPallet",equipment,V(7,0,5.5f));
        Pallet("L03_DispatchPallet",equipment,V(28.5f,0,5.5f)); Pallet("L04_DispatchPallet",equipment,V(31,0,5.5f));
        var props=Group("04_Workstation_Details");
        for(int i=0;i<6;i++)
        {
            Box("A0"+(i+1)+"_PartsBin",props,V(9.7f+i*2,.99f,10.05f),V(.35f,.18f,.25f),"Blue");
            Box("A0"+(i+1)+"_Product",props,V(10.3f+i*2,.99f,10.2f),V(.28f,.18f,.25f),"Steel");
        }
        Box("E03_InspectionMonitor",props,V(26.3f,1.13f,10),V(.45f,.42f,.08f),"Dark");
        Box("E03_InspectionTray",props,V(27.4f,.94f,10.2f),V(.45f,.08f,.35f),"Blue");
        Box("E04_Package",props,V(31,1.12f,10.2f),V(.55f,.44f,.4f),"Carton");
        for(int i=0;i<4;i++) Box("Conveyor_Product_"+i,props,V(11+i*5,.98f,12),V(.4f,.26f,.35f),"Steel");
        var markings=Group("05_Flow_And_Gate_Markings");
        for(int i=0;i<6;i++) Arrow(markings,V(11+i*3.5f,.856f,12),0,"Blue",.65f);
        Arrow(markings,V(31,.022f,8),90,"Blue",.8f);
        for(float x=7.5f;x<27;x+=.6f) Box("ReworkRoute",markings,V(x,.021f,16.5f),V(.35f,.008f,.06f),"Orange",false);
        Arrow(markings,V(8,.026f,16.5f),180,"Orange",.8f);
        GroundText("G01 INBOUND",markings,V(4.5f,.027f,1.4f),.22f);
        GroundText("G02 ENTRY",markings,V(18,.027f,1.4f),.22f);
        GroundText("G03 DISPATCH",markings,V(34.5f,.027f,5.5f),.17f,90);
        var spawn=Group("PlayerSpawn",root,V(18,0,2));
        var lighting=Group("06_Lighting");
        var sun=new GameObject("Factory_KeyLight").AddComponent<Light>(); sun.transform.SetParent(lighting); sun.type=LightType.Directional; sun.intensity=1.5f; sun.transform.rotation=Quaternion.Euler(48,-32,0); sun.shadows=LightShadows.Soft;
        RenderSettings.ambientMode=AmbientMode.Flat; RenderSettings.ambientLight=new Color(.55f,.60f,.65f);
        var camera=new GameObject("Main Camera").AddComponent<Camera>(); camera.tag="MainCamera"; camera.transform.position=V(43,31,-24); camera.transform.LookAt(V(18,0,12)); camera.fieldOfView=48; camera.farClipPlane=180; camera.clearFlags=CameraClearFlags.SolidColor; camera.backgroundColor=new Color(.16f,.20f,.23f); camera.gameObject.AddComponent<AudioListener>();
        var top=new GameObject("Plan Camera (disabled)").AddComponent<Camera>(); top.enabled=false; top.orthographic=true; top.orthographicSize=14.5f; top.transform.position=V(18,45,12); top.transform.rotation=Quaternion.Euler(90,0,0); top.clearFlags=CameraClearFlags.SolidColor; top.backgroundColor=camera.backgroundColor; top.farClipPlane=100;
        // Persist all meshes, including ProBuilder's editable vertex/face data in the prefab.
        for(int i=0;i<meshes.Count;i++)
        {
            var m=meshes[i].GetComponent<MeshFilter>().sharedMesh;
            m.name=meshes[i].name+"_"+i; m.hideFlags=HideFlags.None;
            if(i==0) AssetDatabase.CreateAsset(m,Folder+"/FactoryMeshes.asset");
            else AssetDatabase.AddObjectToAsset(m,Folder+"/FactoryMeshes.asset");
        }
        AssetDatabase.SaveAssets();
        PrefabUtility.SaveAsPrefabAssetAndConnect(root.gameObject,Folder+"/FactoryMap.prefab",InteractionMode.AutomatedAction);
        EditorSceneManager.SaveScene(scene,Folder+"/FactoryMap_36x24.unity");
        AssetDatabase.SaveAssets();
        // Validate the serialized result after reopening, not just the in-memory scene.
        scene=EditorSceneManager.OpenScene(Folder+"/FactoryMap_36x24.unity",Application.isBatchMode ? OpenSceneMode.Single : OpenSceneMode.Additive);
        var objects=scene.GetRootGameObjects().SelectMany(g=>g.GetComponentsInChildren<Transform>(true)).ToArray();
        var pb=objects.Select(t=>t.GetComponent<ProBuilderMesh>()).Where(p=>p!=null).ToArray();
        if(pb.Length!=meshes.Count || pb.Any(p=>p.GetComponent<MeshFilter>().sharedMesh==null)) throw new Exception("Serialized mesh validation failed");
        if(objects.Any(t=>(t.localScale-Vector3.one).sqrMagnitude>.0001f)) throw new Exception("Non-unit transform scale");
        if(objects.Count(t=>t.name.StartsWith("A0") && t.name.EndsWith("_Assembly"))!=6) throw new Exception("Assembly workstation count");
        File.WriteAllText(Folder+"/BuildReport.json", "{\n  \"source\": \"factory-layout-36x24.pdf\",\n  \"floorMeters\": [36,24],\n  \"conveyorLengthMeters\": 24,\n  \"assemblyStations\": 6,\n  \"proBuilderMeshes\": "+pb.Length+",\n  \"unitScales\": true,\n  \"serializedMeshValidation\": true\n}\n");
        Debug.Log("FACTORY_BUILD_SUCCESS: "+pb.Length+" editable ProBuilder meshes; scene and prefab saved.");
        if(!Application.isBatchMode) { Selection.activeGameObject=scene.GetRootGameObjects().First(g=>g.name.StartsWith("FactoryMap")); SceneView.lastActiveSceneView?.FrameSelected(); }
    }
    public static void BuildBatch() { try {Build(); EditorApplication.Exit(0);} catch(Exception ex) {Debug.LogException(ex); EditorApplication.Exit(1);} }
    static Material Mat(string name,Color color) { var s=Shader.Find("Universal Render Pipeline/Lit")??Shader.Find("Standard"); if(s==null) throw new Exception("Lit shader missing"); var m=new Material(s){name=name}; m.color=color; m.SetFloat("_Smoothness",.22f); AssetDatabase.CreateAsset(m,Folder+"/Materials/"+name+".mat"); mats[name]=m; return m; }
    static Transform Group(string name,Transform parent=null,Vector3 pos=default) {var t=new GameObject(name).transform;t.SetParent(parent??root,false);t.localPosition=pos;return t;}
    static ProBuilderMesh Box(string name,Transform parent,Vector3 pos,Vector3 size,string material,bool collider=true) {var p=ShapeGenerator.GenerateCube(PivotLocation.Center,size);p.name=name;p.transform.SetParent(parent,false);p.transform.localPosition=pos;p.ToMesh();p.Refresh();p.GetComponent<MeshRenderer>().sharedMaterial=mats[material];p.gameObject.isStatic=true;if(collider)p.gameObject.AddComponent<BoxCollider>();meshes.Add(p);return p;}
    static void WallX(Transform p,string n,float a,float b) => Box(n,p,V((a+b)/2,2,-.1f),V(b-a,4,.2f),"Wall");
    static void Zone(Transform p,string id,string name,float x,float z,float w,float d,string mat) {var t=Group(id+"_"+name,p);Box("FloorMark",t,V(x+w/2,.005f,z+d/2),V(w,.01f,d),mat,false);bool vertical=w<4&&d>6;GroundText(id+"  "+name,t,V(x+w/2,.019f,vertical?z+d/2:z+d-.45f),w<4?.13f:.18f,vertical?90:0,vertical?d-.5f:w-.5f);var line=.035f;Box("Boundary_S",t,V(x+w/2,.014f,z),V(w,.006f,line),"Yellow",false);Box("Boundary_W",t,V(x,.014f,z+d/2),V(line,.006f,d),"Yellow",false);}
    static void GroundText(string text,Transform parent,Vector3 pos,float size,float angle=0,float maxWidth=0) {var g=new GameObject(text);g.transform.SetParent(parent,false);g.transform.localPosition=pos;g.transform.localRotation=Quaternion.Euler(90,angle,0);var t=g.AddComponent<TextMesh>();t.text=text;t.font=font;t.fontSize=48;font.RequestCharactersInTexture(text,48,FontStyle.Normal);float advance=0;foreach(char c in text)if(font.GetCharacterInfo(c,out var ci,48,FontStyle.Normal))advance+=ci.advance;t.characterSize=maxWidth>0&&advance>0?Mathf.Min(size,maxWidth*10f/advance):size;t.anchor=TextAnchor.MiddleCenter;t.color=new Color(.95f,.96f,.97f);g.GetComponent<MeshRenderer>().sharedMaterial=font.material;}
    static void Bench(string name,Transform parent,Vector3 pos,float w,float d) {var p=Group(name,parent,pos);Box("Worktop",p,V(0,.86f,0),V(w,.08f,d),"Bench");for(int a=-1;a<=1;a+=2)for(int b=-1;b<=1;b+=2)Box("Leg",p,V(a*(w/2-.07f),.41f,b*(d/2-.07f)),V(.09f,.82f,.09f),"Steel");Box("LowerShelf",p,V(0,.22f,0),V(w-.16f,.045f,d-.16f),"Steel");GroundText(name.Split('_')[0],p,V(0,.903f,0),.12f);}
    static void Conveyor(Transform parent) {var p=Group("E01_Conveyor_24m",parent,V(21,0,12));Box("Belt",p,V(0,.795f,0),V(24,.11f,.52f),"Dark");for(int side=-1;side<=1;side+=2){Box("SideRail",p,V(0,.73f,side*.28f),V(24,.22f,.04f),"Steel");for(int i=0;i<13;i++)Box("Support",p,V(-11.8f+i*1.96666f,.32f,side*.23f),V(.09f,.64f,.09f),"Steel");}for(int i=0;i<48;i++)Box("BeltSeam",p,V(-11.75f+i*.5f,.851f,0),V(.016f,.002f,.50f),"Steel",false);}
    static void Rack(string name,Transform parent,Vector3 pos) {var p=Group(name,parent,pos);for(int a=-1;a<=1;a+=2)for(int b=-1;b<=1;b+=2)Box("Upright",p,V(a*1.06f,1.2f,b*.36f),V(.08f,2.4f,.08f),"Blue");for(int i=0;i<4;i++){Box("Shelf",p,V(0,.08f+i*.70f,0),V(2.2f,.08f,.8f),"Steel");for(int j=-1;j<=1;j++)Box("Bin",p,V(j*.64f,.25f+i*.70f,0),V(.5f,.25f,.5f),"Carton");}}
    static void Pallet(string name,Transform parent,Vector3 pos) {var p=Group(name,parent,pos);for(int i=0;i<3;i++)Box("Runner",p,V(-.48f+i*.48f,.055f,0),V(.15f,.11f,1),"Wood");for(int i=0;i<5;i++)Box("Deck",p,V(0,.13f,-.4f+i*.2f),V(1.2f,.04f,.18f),"Wood");for(int x=-1;x<=1;x+=2)for(int z=-1;z<=1;z+=2)Box("Carton",p,V(x*.28f,.4f,z*.23f),V(.50f,.5f,.42f),"Carton");}
    static void TestCell(Transform parent) {var p=Group("E02_AutomaticTest",parent,V(23,0,13.3f));p.localRotation=Quaternion.Euler(0,180,0);Box("Base",p,V(0,.45f,0),V(2.5f,.9f,1.6f),"Blue");Box("Rear",p,V(0,1.35f,-.76f),V(2.5f,.9f,.08f),"Steel");Box("Roof",p,V(0,1.76f,0),V(2.5f,.08f,1.6f),"Steel");for(int s=-1;s<=1;s+=2)Box("Side",p,V(s*1.21f,1.35f,0),V(.08f,.9f,1.6f),"Steel");Box("TestFixture",p,V(0,1.05f,0),V(.7f,.3f,.6f),"Dark");Box("ControlPanel",p,V(.82f,.58f,.81f),V(.5f,.42f,.05f),"Dark");Box("StatusLight",p,V(1.08f,1.87f,0),V(.10f,.14f,.10f),"Green",false);}
    static void Arrow(Transform parent,Vector3 pos,float yaw,string mat,float length) {var p=Group("FlowArrow",parent,pos);p.localRotation=Quaternion.Euler(0,yaw,0);Box("Shaft",p,V(0,0,0),V(length*.7f,.003f,.045f),mat,false);for(int s=-1;s<=1;s+=2){var b=Box("Head",p,V(length*.30f,0,s*.08f),V(length*.30f,.003f,.045f),mat,false);b.transform.localRotation=Quaternion.Euler(0,s*40,0);}}
}
