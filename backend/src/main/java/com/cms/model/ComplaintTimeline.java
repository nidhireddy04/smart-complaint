package com.cms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_timeline")
public class ComplaintTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    private String action;

    @Column(length = 1000)
    private String description;

    private String performedBy;

    private String oldStatus;

    private String newStatus;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public ComplaintTimeline() {}

    public ComplaintTimeline(Complaint complaint, String action, String description, String performedBy) {
        this.complaint = complaint;
        this.action = action;
        this.description = description;
        this.performedBy = performedBy;
        this.createdAt = LocalDateTime.now();
    }

    public ComplaintTimeline(Complaint complaint, String action, String description,
                             String performedBy, String oldStatus, String newStatus) {
        this(complaint, action, description, performedBy);
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public String getOldStatus() { return oldStatus; }
    public void setOldStatus(String oldStatus) { this.oldStatus = oldStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
