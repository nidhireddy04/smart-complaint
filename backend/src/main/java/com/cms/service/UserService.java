package com.cms.service;

import com.cms.model.User;
import com.cms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }
        return user;
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> findByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    public List<User> findStaffByDepartment(String department) {
        return userRepository.findByRoleAndDepartment(User.Role.STAFF, department);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User update(Long id, User userData) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (userData.getName() != null) user.setName(userData.getName());
        if (userData.getPhone() != null) user.setPhone(userData.getPhone());
        if (userData.getDepartment() != null) user.setDepartment(userData.getDepartment());
        return userRepository.save(user);
    }
}
