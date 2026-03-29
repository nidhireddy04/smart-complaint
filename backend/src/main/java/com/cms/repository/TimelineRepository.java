package com.cms.repository;

import com.cms.model.ComplaintTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimelineRepository extends JpaRepository<ComplaintTimeline, Long> {
    List<ComplaintTimeline> findByComplaintIdOrderByCreatedAtDesc(Long complaintId);
}
