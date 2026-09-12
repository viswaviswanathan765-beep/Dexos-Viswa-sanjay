package com.archplanner.repository;
import com.archplanner.model.CostEstimate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface CostEstimateRepository extends JpaRepository<CostEstimate, Long> {
    Optional<CostEstimate> findByFloorPlanId(Long floorPlanId);
}