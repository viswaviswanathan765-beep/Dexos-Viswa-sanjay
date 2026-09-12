package com.archplanner.repository;
import com.archplanner.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByProjectId(Long projectId);
    List<Room> findByFloorPlanId(Long floorPlanId);
}