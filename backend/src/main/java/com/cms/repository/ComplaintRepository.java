package com.cms.repository;

import com.cms.model.Complaint;
import com.cms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserOrderByCreatedAtDesc(User user);
    List<Complaint> findByAssignedStaffOrderByPriorityScoreDesc(User staff);
    List<Complaint> findByStatus(Complaint.Status status);
    List<Complaint> findByCategory(Complaint.Category category);
    List<Complaint> findByAssignedDepartment(String department);
    List<Complaint> findAllByOrderByPriorityScoreDesc();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countByStatus();

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countByCategory();

    @Query("SELECT c.priority, COUNT(c) FROM Complaint c GROUP BY c.priority")
    List<Object[]> countByPriority();

    @Query("SELECT c.assignedDepartment, COUNT(c) FROM Complaint c WHERE c.assignedDepartment IS NOT NULL GROUP BY c.assignedDepartment")
    List<Object[]> countByDepartment();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = 'RESOLVED' OR c.status = 'CLOSED'")
    long countResolved();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status != 'RESOLVED' AND c.status != 'CLOSED'")
    long countPending();
}
