package com.archplanner.repository;
import com.archplanner.model.RoomRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RoomRelationshipRepository extends JpaRepository<RoomRelationship, Long> {
    List<RoomRelationship> findByProjectId(Long projectId);
}