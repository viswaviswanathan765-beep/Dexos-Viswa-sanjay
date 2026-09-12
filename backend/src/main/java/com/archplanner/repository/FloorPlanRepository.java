package com.archplanner.repository;
import com.archplanner.model.FloorPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface FloorPlanRepository extends JpaRepository<FloorPlan, Long> {
    List<FloorPlan> findByProjectIdOrderByIdDesc(Long projectId);
}