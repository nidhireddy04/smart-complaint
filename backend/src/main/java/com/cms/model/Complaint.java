package com.cms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Enumerated(EnumType.STRING)
    private Urgency urgency = Urgency.MEDIUM;

    @Enumerated(EnumType.STRING)
    private Status status = Status.SUBMITTED;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    private int priorityScore;

    private String location;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_staff_id")
    private User assignedStaff;

    private String assignedDepartment;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;

    private String resolutionNotes;

    private int rating;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    @JsonIgnore
    private List<ComplaintTimeline> timeline = new ArrayList<>();

    // Enums
    public enum Category {
        INFRASTRUCTURE("Infrastructure", 9),
        SAFETY("Safety & Security", 10),
        CLEANLINESS("Cleanliness & Hygiene", 7),
        IT_SERVICES("IT Services", 6),
        ELECTRICAL("Electrical", 8),
        PLUMBING("Plumbing", 8),
        HOSTEL("Hostel", 7),
        CANTEEN("Canteen & Food", 5),
        TRANSPORT("Transport", 6),
        ACADEMIC("Academic", 7),
        OTHER("Other", 4);

        private final String displayName;
        private final int weight;

        Category(String displayName, int weight) {
            this.displayName = displayName;
            this.weight = weight;
        }

        public String getDisplayName() { return displayName; }
        public int getWeight() { return weight; }
    }

    public enum Urgency {
        LOW(1), MEDIUM(2), HIGH(3), CRITICAL(4);

        private final int multiplier;

        Urgency(int multiplier) { this.multiplier = multiplier; }
        public int getMultiplier() { return multiplier; }
    }

    public enum Status {
        SUBMITTED, UNDER_REVIEW, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, REOPENED
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    // Constructors
    public Complaint() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Urgency getUrgency() { return urgency; }
    public void setUrgency(Urgency urgency) { this.urgency = urgency; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public int getPriorityScore() { return priorityScore; }
    public void setPriorityScore(int priorityScore) { this.priorityScore = priorityScore; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getAssignedStaff() { return assignedStaff; }
    public void setAssignedStaff(User assignedStaff) { this.assignedStaff = assignedStaff; }

    public String getAssignedDepartment() { return assignedDepartment; }
    public void setAssignedDepartment(String assignedDepartment) { this.assignedDepartment = assignedDepartment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public List<ComplaintTimeline> getTimeline() { return timeline; }
    public void setTimeline(List<ComplaintTimeline> timeline) { this.timeline = timeline; }
}
