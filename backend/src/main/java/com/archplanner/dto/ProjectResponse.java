package com.archplanner.dto;
import java.time.LocalDateTime;
import java.util.List;
public class ProjectResponse {
    public Long id;
    public String name;
    public PlotSpec plot;
    public List<RoomSpec> rooms;
    public List<RelationshipSpec> relationships;
    public LocalDateTime createdAt;
}