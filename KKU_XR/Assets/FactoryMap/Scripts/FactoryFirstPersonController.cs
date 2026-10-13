using UnityEngine;
using UnityEngine.InputSystem;

[DisallowMultipleComponent]
[RequireComponent(typeof(CharacterController))]
public sealed class FactoryFirstPersonController : MonoBehaviour
{
    [SerializeField] Transform view;
    [SerializeField, Min(0.1f)] float moveSpeed = 4f;
    [SerializeField, Min(0.01f)] float mouseSensitivity = 0.12f;
    [SerializeField, Range(1f, 89f)] float pitchLimit = 85f;
    [SerializeField] float gravity = -20f;
    CharacterController controller;
    float pitch;
    float verticalSpeed;
    bool captured;

    public Transform View => view;

    void Awake()
    {
        controller = GetComponent<CharacterController>();
        if (view == null)
        {
            var camera = GetComponentInChildren<Camera>();
            if (camera != null) view = camera.transform;
        }
        if (view == null) { enabled = false; return; }
        pitch = Mathf.DeltaAngle(0f, view.localEulerAngles.x);
    }

    void Start() => CaptureCursor();

    void Update()
    {
        if (!Application.isFocused) return;
        var keyboard = Keyboard.current;
        var mouse = Mouse.current;
        if (keyboard != null && keyboard.escapeKey.wasPressedThisFrame)
        {
            ReleaseCursor();
            return;
        }
        if (!captured || Cursor.lockState != CursorLockMode.Locked)
        {
            captured = false;
            if (mouse != null && mouse.leftButton.wasPressedThisFrame) CaptureCursor();
            return;
        }
        var movement = Vector2.zero;
        if (keyboard != null)
        {
            movement.x = (keyboard.dKey.isPressed ? 1 : 0) - (keyboard.aKey.isPressed ? 1 : 0);
            movement.y = (keyboard.wKey.isPressed ? 1 : 0) - (keyboard.sKey.isPressed ? 1 : 0);
        }
        MoveAndLook(movement, mouse != null ? mouse.delta.ReadValue() : Vector2.zero, Time.deltaTime);
    }

    // Mouse delta is measured in pixels per frame; it must not be multiplied by deltaTime.
    public void MoveAndLook(Vector2 movement, Vector2 mouseDelta, float deltaTime)
    {
        if (controller == null) controller = GetComponent<CharacterController>();
        if (view == null || deltaTime <= 0f) return;
        transform.Rotate(0f, mouseDelta.x * mouseSensitivity, 0f, Space.Self);
        pitch = Mathf.Clamp(pitch - mouseDelta.y * mouseSensitivity, -pitchLimit, pitchLimit);
        view.localRotation = Quaternion.Euler(pitch, 0f, 0f);
        var input = Vector2.ClampMagnitude(movement, 1f);
        var horizontal = transform.right * input.x + transform.forward * input.y;
        if (controller.isGrounded && verticalSpeed < 0f) verticalSpeed = -2f;
        verticalSpeed += gravity * deltaTime;
        controller.Move((horizontal * moveSpeed + Vector3.up * verticalSpeed) * deltaTime);
    }

    void CaptureCursor()
    {
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
        captured = true;
    }

    void ReleaseCursor()
    {
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible = true;
        captured = false;
    }

    void OnApplicationFocus(bool focused)
    {
        if (!focused) ReleaseCursor();
    }

    void OnDisable() => ReleaseCursor();
}
