package com.cms.service;

import com.cms.model.*;
import com.cms.repository.ComplaintRepository;
import com.cms.repository.TimelineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private TimelineRepository timelineRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    // ==================== PRIORITY ENGINE ====================

    public int calculatePriorityScore(Complaint complaint) {
        int categoryWeight = complaint.getCategory().getWeight();
        int urgencyMultiplier = complaint.getUrgency().getMultiplier();

        // Base score: category weight * urgency multiplier * 10
        int score = categoryWeight * urgencyMultiplier * 10;

        // Age boost: +5 per day since creation
        if (complaint.getCreatedAt() != null) {
            long daysSinceCreation = ChronoUnit.DAYS.between(complaint.getCreatedAt(), LocalDateTime.now());
            score += (int) (daysSinceCreation * 5);
        }

        // Similar complaints boost
        List<Complaint> similar = complaintRepository.findByCategory(complaint.getCategory());
        long pendingSimilar = similar.stream()
                .filter(c -> c.getStatus() != Complaint.Status.RESOLVED && c.getStatus() != Complaint.Status.CLOSED)
                .count();
        if (pendingSimilar > 3) score += 20;
        if (pendingSimilar > 5) score += 30;

        return Math.min(score, 400); // Cap at 400
    }

    public Complaint.Priority determinePriority(int score) {
        if (score >= 300) return Complaint.Priority.CRITICAL;
        if (score >= 200) return Complaint.Priority.HIGH;
        if (score >= 100) return Complaint.Priority.MEDIUM;
        return Complaint.Priority.LOW;
    }

    // ==================== CRUD OPERATIONS ====================

    public Complaint createComplaint(Complaint complaint, Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        complaint.setUser(user);
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());
        complaint.setStatus(Complaint.Status.SUBMITTED);

        // Calculate priority
        int score = calculatePriorityScore(complaint);
        complaint.setPriorityScore(score);
        complaint.setPriority(determinePriority(score));

        Complaint saved = complaintRepository.save(complaint);

        // Add timeline entry
        timelineRepository.save(new ComplaintTimeline(
                saved, "CREATED", "Complaint registered by " + user.getName(),
                user.getName(), null, "SUBMITTED"
        ));

        // Notify admins
        List<User> admins = userService.findByRole(User.Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(admin,
                    "New Complaint #" + saved.getId(),
                    "New " + saved.getPriority() + " priority complaint: " + saved.getTitle(),
                    "INFO", saved.getId());
        }

        return saved;
    }

    public Complaint updateStatus(Long complaintId, Complaint.Status newStatus, String notes, Long performedById) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        User performer = userService.findById(performedById)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldStatus = complaint.getStatus().name();
        complaint.setStatus(newStatus);
        complaint.setUpdatedAt(LocalDateTime.now());

        if (newStatus == Complaint.Status.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
            if (notes != null) complaint.setResolutionNotes(notes);
        }

        Complaint saved = complaintRepository.save(complaint);

        // Timeline entry
        timelineRepository.save(new ComplaintTimeline(
                saved, "STATUS_CHANGE",
                "Status changed from " + oldStatus + " to " + newStatus.name() +
                        (notes != null ? ". Notes: " + notes : ""),
                performer.getName(), oldStatus, newStatus.name()
        ));

        // Notify complaint owner
        notificationService.createNotification(complaint.getUser(),
                "Complaint #" + complaintId + " Updated",
                "Your complaint status changed to " + newStatus.name(),
                newStatus == Complaint.Status.RESOLVED ? "SUCCESS" : "INFO",
                complaintId);

        return saved;
    }

    public Complaint assignComplaint(Long complaintId, Long staffId, String department, Long adminId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        User admin = userService.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        String oldStatus = complaint.getStatus().name();

        if (staffId != null) {
            User staff = userService.findById(staffId)
                    .orElseThrow(() -> new RuntimeException("Staff not found"));
            complaint.setAssignedStaff(staff);

            // Notify assigned staff
            notificationService.createNotification(staff,
                    "New Assignment",
                    "You have been assigned complaint #" + complaintId + ": " + complaint.getTitle(),
                    "WARNING", complaintId);
        }

        if (department != null) {
            complaint.setAssignedDepartment(department);
        }

        complaint.setStatus(Complaint.Status.ASSIGNED);
        complaint.setUpdatedAt(LocalDateTime.now());

        // Recalculate priority
        int score = calculatePriorityScore(complaint);
        complaint.setPriorityScore(score);
        complaint.setPriority(determinePriority(score));

        Complaint saved = complaintRepository.save(complaint);

        // Timeline entry
        String assignInfo = department != null ? "Assigned to " + department + " department" : "Assigned";
        if (complaint.getAssignedStaff() != null) {
            assignInfo += " (Staff: " + complaint.getAssignedStaff().getName() + ")";
        }
        timelineRepository.save(new ComplaintTimeline(
                saved, "ASSIGNED", assignInfo,
                admin.getName(), oldStatus, "ASSIGNED"
        ));

        // Notify user
        notificationService.createNotification(complaint.getUser(),
                "Complaint #" + complaintId + " Assigned",
                "Your complaint has been assigned to " +
                        (department != null ? department + " department" : "staff"),
                "INFO", complaintId);

        return saved;
    }

    public Complaint rateComplaint(Long complaintId, int rating) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setRating(rating);
        return complaintRepository.save(complaint);
    }

    // ==================== QUERIES ====================

    public List<Complaint> findAll() {
        return complaintRepository.findAllByOrderByPriorityScoreDesc();
    }

    public Optional<Complaint> findById(Long id) {
        return complaintRepository.findById(id);
    }

    public List<Complaint> findByUser(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return complaintRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Complaint> findByStaff(Long staffId) {
        User staff = userService.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        return complaintRepository.findByAssignedStaffOrderByPriorityScoreDesc(staff);
    }

    public List<Complaint> findByStatus(Complaint.Status status) {
        return complaintRepository.findByStatus(status);
    }

    public List<Complaint> findByDepartment(String department) {
        return complaintRepository.findByAssignedDepartment(department);
    }

    public List<ComplaintTimeline> getTimeline(Long complaintId) {
        return timelineRepository.findByComplaintIdOrderByCreatedAtDesc(complaintId);
    }

    // ==================== ANALYTICS ====================

    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new LinkedHashMap<>();

        analytics.put("total", complaintRepository.count());
        analytics.put("resolved", complaintRepository.countResolved());
        analytics.put("pending", complaintRepository.countPending());

        // Status distribution
        Map<String, Long> statusDist = new LinkedHashMap<>();
        for (Object[] row : complaintRepository.countByStatus()) {
            statusDist.put(row[0].toString(), (Long) row[1]);
        }
        analytics.put("statusDistribution", statusDist);

        // Category distribution
        Map<String, Long> categoryDist = new LinkedHashMap<>();
        for (Object[] row : complaintRepository.countByCategory()) {
            categoryDist.put(row[0].toString(), (Long) row[1]);
        }
        analytics.put("categoryDistribution", categoryDist);

        // Priority distribution
        Map<String, Long> priorityDist = new LinkedHashMap<>();
        for (Object[] row : complaintRepository.countByPriority()) {
            priorityDist.put(row[0].toString(), (Long) row[1]);
        }
        analytics.put("priorityDistribution", priorityDist);

        // Department distribution
        Map<String, Long> deptDist = new LinkedHashMap<>();
        for (Object[] row : complaintRepository.countByDepartment()) {
            deptDist.put(row[0].toString(), (Long) row[1]);
        }
        analytics.put("departmentDistribution", deptDist);

        // Average resolution time (for resolved complaints)
        List<Complaint> resolved = complaintRepository.findByStatus(Complaint.Status.RESOLVED);
        resolved.addAll(complaintRepository.findByStatus(Complaint.Status.CLOSED));
        if (!resolved.isEmpty()) {
            double avgHours = resolved.stream()
                    .filter(c -> c.getResolvedAt() != null)
                    .mapToLong(c -> ChronoUnit.HOURS.between(c.getCreatedAt(), c.getResolvedAt()))
                    .average()
                    .orElse(0);
            analytics.put("avgResolutionHours", Math.round(avgHours * 10.0) / 10.0);
        } else {
            analytics.put("avgResolutionHours", 0);
        }

        // Resolution rate
        long total = complaintRepository.count();
        long resolvedCount = complaintRepository.countResolved();
        analytics.put("resolutionRate", total > 0 ? Math.round((resolvedCount * 100.0) / total) : 0);

        return analytics;
    }

    public Map<String, Object> generateReport() {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("generatedAt", LocalDateTime.now().toString());
        report.put("analytics", getAnalytics());
        report.put("allComplaints", findAll());

        // Top overdue complaints (pending > 3 days)
        List<Complaint> overdue = findAll().stream()
                .filter(c -> c.getStatus() != Complaint.Status.RESOLVED
                        && c.getStatus() != Complaint.Status.CLOSED)
                .filter(c -> ChronoUnit.DAYS.between(c.getCreatedAt(), LocalDateTime.now()) > 3)
                .collect(Collectors.toList());
        report.put("overdueComplaints", overdue);
        report.put("overdueCount", overdue.size());

        return report;
    }
}
