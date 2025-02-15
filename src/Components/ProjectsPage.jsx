import { useState, useEffect } from "react";
import { Table, Button, Container } from "react-bootstrap";
import CurrentProjects from "./projects/currentProjects";
import CompletedProjects from "./projects/CompletedProjects";
import SupportProjects from "./projects/supportProjects";

export default function ProjectsPage() {
  return (
    <div>
      <div>
        <SupportProjects />
      </div>
      <div>
        <CurrentProjects />
      </div>
      <div>
        <CompletedProjects />
      </div>
    </div>
  );
}
