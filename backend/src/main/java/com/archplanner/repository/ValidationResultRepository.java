package com.archplanner.repository;
import com.archplanner.model.ValidationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ValidationResultRepository extends JpaRepository<ValidationResult, Long> {
    List<ValidationResult> findByFloorPlanId(Long floorPlanId);
}