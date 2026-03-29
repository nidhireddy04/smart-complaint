package com.cms.controller;

import com.cms.model.Complaint;
import com.cms.model.ComplaintTimeline;
import com.cms.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    // Create new complaint
    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody Map<String, Object> payload) {
        try {
            Complaint complaint = new Complaint();
            complaint.setTitle((String) payload.get("title"));
            complaint.setDescription((String) payload.get("description"));
            complaint.setCategory(Complaint.Category.valueOf((String) payload.get("category")));
            complaint.setUrgency(Complaint.Urgency.valueOf((String) payload.get("urgency")));
            complaint.setLocation((String) payload.get("location"));

            Long userId = Long.valueOf(payload.get("userId").toString());
            Complaint created = complaintService.createComplaint(complaint, userId);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get all complaints (ordered by priority)
    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.findAll());
    }

    // Get complaint by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaint(@PathVariable Long id) {
        Optional<Complaint> complaint = complaintService.findById(id);
        return complaint.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get complaints by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Complaint>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(complaintService.findByUser(userId));
    }

    // Get complaints assigned to staff
    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<Complaint>> getByStaff(@PathVariable Long staffId) {
        return ResponseEntity.ok(complaintService.findByStaff(staffId));
    }

    // Get complaints by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Complaint>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(complaintService.findByStatus(
                Complaint.Status.valueOf(status.toUpperCase())));
    }

    // Get complaints by department
    @GetMapping("/department/{department}")
    public ResponseEntity<List<Complaint>> getByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(complaintService.findByDepartment(department));
    }

    // Update complaint status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Complaint.Status newStatus = Complaint.Status.valueOf((String) payload.get("status"));
            String notes = (String) payload.get("notes");
            Long performedById = Long.valueOf(payload.get("performedById").toString());

            Complaint updated = complaintService.updateStatus(id, newStatus, notes, performedById);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Assign complaint to staff/department
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignComplaint(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Long staffId = payload.get("staffId") != null ?
                    Long.valueOf(payload.get("staffId").toString()) : null;
            String department = (String) payload.get("department");
            Long adminId = Long.valueOf(payload.get("adminId").toString());

            Complaint assigned = complaintService.assignComplaint(id, staffId, department, adminId);
            return ResponseEntity.ok(assigned);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Rate resolved complaint
    @PutMapping("/{id}/rate")
    public ResponseEntity<?> rateComplaint(@PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        try {
            Complaint rated = complaintService.rateComplaint(id, payload.get("rating"));
            return ResponseEntity.ok(rated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get complaint timeline
    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<ComplaintTimeline>> getTimeline(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getTimeline(id));
    }

    // Get analytics
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(complaintService.getAnalytics());
    }

    // Generate report
    @GetMapping("/report")
    public ResponseEntity<Map<String, Object>> generateReport() {
        return ResponseEntity.ok(complaintService.generateReport());
    }
}
