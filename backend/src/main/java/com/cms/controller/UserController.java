package com.cms.controller;

import com.cms.model.User;
import com.cms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registered = userService.register(user);
            return ResponseEntity.ok(sanitizeUser(registered));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            User user = userService.login(credentials.get("email"), credentials.get("password"));
            return ResponseEntity.ok(sanitizeUser(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(sanitizeUser(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userService.findAll().stream()
                .map(this::sanitizeUser)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<Map<String, Object>>> getUsersByRole(@PathVariable String role) {
        List<Map<String, Object>> users = userService.findByRole(User.Role.valueOf(role.toUpperCase()))
                .stream()
                .map(this::sanitizeUser)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/staff/department/{department}")
    public ResponseEntity<List<Map<String, Object>>> getStaffByDepartment(@PathVariable String department) {
        List<Map<String, Object>> staff = userService.findStaffByDepartment(department)
                .stream()
                .map(this::sanitizeUser)
                .toList();
        return ResponseEntity.ok(staff);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userData) {
        try {
            User updated = userService.update(id, userData);
            return ResponseEntity.ok(sanitizeUser(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Remove password from response
    private Map<String, Object> sanitizeUser(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("role", user.getRole());
        map.put("department", user.getDepartment());
        map.put("phone", user.getPhone());
        map.put("createdAt", user.getCreatedAt());
        map.put("active", user.isActive());
        return map;
    }
}
