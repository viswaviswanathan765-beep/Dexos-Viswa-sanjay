package com.archplanner.dto;
import java.util.List;
public class CreateProjectRequest {
    public String projectName;
    public PlotSpec plot;
    public List<RoomSpec> rooms;
    public List<RelationshipSpec> relationships;
    public String naturalLanguageInput;
}