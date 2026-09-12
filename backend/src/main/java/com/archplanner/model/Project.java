package com.archplanner.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String name;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    @OneToOne(mappedBy = "project", cascade = CascadeType.ALL)
    public Plot plot;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "projectId")
    public List<Room> rooms;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "projectId")
    public List<RoomRelationship> relationships;
}