package com.cms.config;

import com.cms.model.*;
import com.cms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private ComplaintRepository complaintRepository;
    @Autowired private TimelineRepository timelineRepository;
    @Autowired private NotificationRepository notificationRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // ===================== SEED USERS =====================
        User admin = new User("Admin User", "admin@system.com", "admin123", User.Role.ADMIN, "Administration");
        admin.setPhone("9876543210");

        User staff1 = new User("Rajesh Kumar", "staff1@system.com", "staff123", User.Role.STAFF, "Infrastructure");
        staff1.setPhone("9876543211");

        User staff2 = new User("Priya Sharma", "staff2@system.com", "staff123", User.Role.STAFF, "IT Services");
        staff2.setPhone("9876543212");

        User staff3 = new User("Amit Patel", "staff3@system.com", "staff123", User.Role.STAFF, "Electrical");
        staff3.setPhone("9876543213");

        User staff4 = new User("Sunita Verma", "staff4@system.com", "staff123", User.Role.STAFF, "Housekeeping");
        staff4.setPhone("9876543214");

        User user1 = new User("Rahul Singh", "user@system.com", "user123", User.Role.USER, null);
        user1.setPhone("9876543215");

        User user2 = new User("Ananya Gupta", "ananya@system.com", "user123", User.Role.USER, null);
        user2.setPhone("9876543216");

        User user3 = new User("Vikram Reddy", "vikram@system.com", "user123", User.Role.USER, null);
        user3.setPhone("9876543217");

        userRepository.saveAll(List.of(admin, staff1, staff2, staff3, staff4, user1, user2, user3));

        // ===================== SEED COMPLAINTS =====================

        // Complaint 1 - Resolved
        Complaint c1 = new Complaint();
        c1.setTitle("Water leakage in Hostel Block A");
        c1.setDescription("Severe water leakage from the ceiling of Room 204 in Block A. The water is dripping continuously and damaging furniture.");
        c1.setCategory(Complaint.Category.PLUMBING);
        c1.setUrgency(Complaint.Urgency.HIGH);
        c1.setStatus(Complaint.Status.RESOLVED);
        c1.setPriority(Complaint.Priority.HIGH);
        c1.setPriorityScore(240);
        c1.setLocation("Hostel Block A, Room 204");
        c1.setUser(user1);
        c1.setAssignedStaff(staff1);
        c1.setAssignedDepartment("Infrastructure");
        c1.setCreatedAt(LocalDateTime.now().minusDays(7));
        c1.setUpdatedAt(LocalDateTime.now().minusDays(1));
        c1.setResolvedAt(LocalDateTime.now().minusDays(1));
        c1.setResolutionNotes("Fixed the leaking pipe and replaced damaged ceiling tiles.");
        c1.setRating(4);
        complaintRepository.save(c1);

        // Complaint 2 - In Progress
        Complaint c2 = new Complaint();
        c2.setTitle("WiFi not working in Library");
        c2.setDescription("The WiFi network has been down in the central library for the past 2 days. Students are unable to access online resources.");
        c2.setCategory(Complaint.Category.IT_SERVICES);
        c2.setUrgency(Complaint.Urgency.HIGH);
        c2.setStatus(Complaint.Status.IN_PROGRESS);
        c2.setPriority(Complaint.Priority.HIGH);
        c2.setPriorityScore(200);
        c2.setLocation("Central Library, 2nd Floor");
        c2.setUser(user2);
        c2.setAssignedStaff(staff2);
        c2.setAssignedDepartment("IT Services");
        c2.setCreatedAt(LocalDateTime.now().minusDays(3));
        c2.setUpdatedAt(LocalDateTime.now().minusHours(6));
        complaintRepository.save(c2);

        // Complaint 3 - Assigned
        Complaint c3 = new Complaint();
        c3.setTitle("Broken window in Classroom 301");
        c3.setDescription("A window pane in Classroom 301 is cracked and poses a safety risk. Glass fragments may fall on students.");
        c3.setCategory(Complaint.Category.SAFETY);
        c3.setUrgency(Complaint.Urgency.CRITICAL);
        c3.setStatus(Complaint.Status.ASSIGNED);
        c3.setPriority(Complaint.Priority.CRITICAL);
        c3.setPriorityScore(400);
        c3.setLocation("Academic Block B, Room 301");
        c3.setUser(user3);
        c3.setAssignedStaff(staff1);
        c3.setAssignedDepartment("Infrastructure");
        c3.setCreatedAt(LocalDateTime.now().minusDays(1));
        c3.setUpdatedAt(LocalDateTime.now().minusHours(2));
        complaintRepository.save(c3);

        // Complaint 4 - Submitted
        Complaint c4 = new Complaint();
        c4.setTitle("Dirty washrooms in Ground Floor");
        c4.setDescription("The washrooms on the ground floor of the main building have not been cleaned for 2 days. Very unhygienic conditions.");
        c4.setCategory(Complaint.Category.CLEANLINESS);
        c4.setUrgency(Complaint.Urgency.MEDIUM);
        c4.setStatus(Complaint.Status.SUBMITTED);
        c4.setPriority(Complaint.Priority.MEDIUM);
        c4.setPriorityScore(140);
        c4.setLocation("Main Building, Ground Floor");
        c4.setUser(user1);
        c4.setCreatedAt(LocalDateTime.now().minusHours(8));
        c4.setUpdatedAt(LocalDateTime.now().minusHours(8));
        complaintRepository.save(c4);

        // Complaint 5 - Under Review
        Complaint c5 = new Complaint();
        c5.setTitle("Power fluctuations in Computer Lab");
        c5.setDescription("Frequent power fluctuations in the computer lab are causing system shutdowns and potential data loss.");
        c5.setCategory(Complaint.Category.ELECTRICAL);
        c5.setUrgency(Complaint.Urgency.HIGH);
        c5.setStatus(Complaint.Status.UNDER_REVIEW);
        c5.setPriority(Complaint.Priority.HIGH);
        c5.setPriorityScore(240);
        c5.setLocation("IT Block, Computer Lab 2");
        c5.setUser(user2);
        c5.setCreatedAt(LocalDateTime.now().minusDays(2));
        c5.setUpdatedAt(LocalDateTime.now().minusHours(4));
        complaintRepository.save(c5);

        // Complaint 6 - Submitted
        Complaint c6 = new Complaint();
        c6.setTitle("Poor food quality in Canteen");
        c6.setDescription("The food quality in the main canteen has deteriorated significantly. Several students have reported stomach issues.");
        c6.setCategory(Complaint.Category.CANTEEN);
        c6.setUrgency(Complaint.Urgency.MEDIUM);
        c6.setStatus(Complaint.Status.SUBMITTED);
        c6.setPriority(Complaint.Priority.MEDIUM);
        c6.setPriorityScore(100);
        c6.setLocation("Main Canteen");
        c6.setUser(user3);
        c6.setCreatedAt(LocalDateTime.now().minusHours(5));
        c6.setUpdatedAt(LocalDateTime.now().minusHours(5));
        complaintRepository.save(c6);

        // Complaint 7 - Resolved
        Complaint c7 = new Complaint();
        c7.setTitle("AC not working in Seminar Hall");
        c7.setDescription("The air conditioning system in the seminar hall is not functioning. Events cannot be held comfortably.");
        c7.setCategory(Complaint.Category.ELECTRICAL);
        c7.setUrgency(Complaint.Urgency.MEDIUM);
        c7.setStatus(Complaint.Status.RESOLVED);
        c7.setPriority(Complaint.Priority.MEDIUM);
        c7.setPriorityScore(160);
        c7.setLocation("Seminar Hall, Block C");
        c7.setUser(user1);
        c7.setAssignedStaff(staff3);
        c7.setAssignedDepartment("Electrical");
        c7.setCreatedAt(LocalDateTime.now().minusDays(10));
        c7.setUpdatedAt(LocalDateTime.now().minusDays(5));
        c7.setResolvedAt(LocalDateTime.now().minusDays(5));
        c7.setResolutionNotes("Replaced the compressor unit and recharged the coolant.");
        c7.setRating(5);
        complaintRepository.save(c7);

        // Complaint 8 - Closed
        Complaint c8 = new Complaint();
        c8.setTitle("Bus route timings incorrect");
        c8.setDescription("College bus Route 5 has been consistently arriving 30 minutes late, causing students to miss first period.");
        c8.setCategory(Complaint.Category.TRANSPORT);
        c8.setUrgency(Complaint.Urgency.LOW);
        c8.setStatus(Complaint.Status.CLOSED);
        c8.setPriority(Complaint.Priority.LOW);
        c8.setPriorityScore(60);
        c8.setLocation("Bus Stand");
        c8.setUser(user2);
        c8.setAssignedDepartment("Transport");
        c8.setCreatedAt(LocalDateTime.now().minusDays(15));
        c8.setUpdatedAt(LocalDateTime.now().minusDays(10));
        c8.setResolvedAt(LocalDateTime.now().minusDays(10));
        c8.setResolutionNotes("Route timings have been adjusted. Bus will now depart 15 minutes earlier.");
        c8.setRating(3);
        complaintRepository.save(c8);

        // =================== SEED TIMELINES ===================
        timelineRepository.save(new ComplaintTimeline(c1, "CREATED", "Complaint registered", user1.getName(), null, "SUBMITTED"));
        timelineRepository.save(new ComplaintTimeline(c1, "STATUS_CHANGE", "Under review by admin", admin.getName(), "SUBMITTED", "UNDER_REVIEW"));
        timelineRepository.save(new ComplaintTimeline(c1, "ASSIGNED", "Assigned to Infrastructure dept", admin.getName(), "UNDER_REVIEW", "ASSIGNED"));
        timelineRepository.save(new ComplaintTimeline(c1, "STATUS_CHANGE", "Work started", staff1.getName(), "ASSIGNED", "IN_PROGRESS"));
        timelineRepository.save(new ComplaintTimeline(c1, "STATUS_CHANGE", "Issue resolved", staff1.getName(), "IN_PROGRESS", "RESOLVED"));

        timelineRepository.save(new ComplaintTimeline(c2, "CREATED", "Complaint registered", user2.getName(), null, "SUBMITTED"));
        timelineRepository.save(new ComplaintTimeline(c2, "ASSIGNED", "Assigned to IT Services", admin.getName(), "SUBMITTED", "ASSIGNED"));
        timelineRepository.save(new ComplaintTimeline(c2, "STATUS_CHANGE", "Technician dispatched", staff2.getName(), "ASSIGNED", "IN_PROGRESS"));

        timelineRepository.save(new ComplaintTimeline(c3, "CREATED", "Complaint registered - CRITICAL", user3.getName(), null, "SUBMITTED"));
        timelineRepository.save(new ComplaintTimeline(c3, "ASSIGNED", "Urgent: Assigned to Infrastructure", admin.getName(), "SUBMITTED", "ASSIGNED"));

        timelineRepository.save(new ComplaintTimeline(c4, "CREATED", "Complaint registered", user1.getName(), null, "SUBMITTED"));
        timelineRepository.save(new ComplaintTimeline(c5, "CREATED", "Complaint registered", user2.getName(), null, "SUBMITTED"));
        timelineRepository.save(new ComplaintTimeline(c5, "STATUS_CHANGE", "Being reviewed", admin.getName(), "SUBMITTED", "UNDER_REVIEW"));

        // =================== SEED NOTIFICATIONS ===================
        notificationRepository.save(new Notification(admin, "New Complaint #1", "New HIGH priority complaint: Water leakage", "INFO", c1.getId()));
        notificationRepository.save(new Notification(admin, "New Complaint #3", "New CRITICAL priority complaint: Broken window", "WARNING", c3.getId()));
        notificationRepository.save(new Notification(admin, "New Complaint #4", "New MEDIUM priority complaint: Dirty washrooms", "INFO", c4.getId()));
        notificationRepository.save(new Notification(staff1, "Assignment", "You've been assigned: Water leakage in Hostel Block A", "INFO", c1.getId()));
        notificationRepository.save(new Notification(staff1, "New Assignment", "CRITICAL: Broken window in Classroom 301", "WARNING", c3.getId()));
        notificationRepository.save(new Notification(user1, "Complaint Resolved", "Your complaint #1 has been resolved", "SUCCESS", c1.getId()));

        System.out.println("========================================");
        System.out.println("  SEED DATA LOADED SUCCESSFULLY!");
        System.out.println("  Users: " + userRepository.count());
        System.out.println("  Complaints: " + complaintRepository.count());
        System.out.println("========================================");
    }
}
