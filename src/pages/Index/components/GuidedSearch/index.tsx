import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FilterSection from "./FilterSection";
import { cultureTags } from "../../data";
import { useState, useMemo } from "react";
import type { Candidate } from "../../../../components/LandingPage";

const skillsList = [
  "Adaptability",
  "Communication",
  "Customer Service",
  "Data Analysis",
  "Excel",
  "Finance",
  "Graphic Design",
  "Leadership",
  "Marketing",
  "Programming",
  "Project Management",
  "Research",
  "Sales",
  "Social Media Management",
  "Team Collaboration",
  "Technical Support",
  "Web Development"
];

interface GuidedSearchProps {
  candidates: Candidate[];
}

const GuidedSearch = ({ candidates }: GuidedSearchProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filterOptions = useMemo(() => {
    const universities = [...new Set(candidates.map(c => c.university))].filter(Boolean).sort();
    const majors = [...new Set(candidates.map(c => c.major))].filter(Boolean).sort();
    const gradYears = [...new Set(candidates.map(c => c.graduationYear?.toString()))].filter(Boolean).sort();

    return {
      universities,
      majors,
      gradYears
    };
  }, [candidates]);

  return (
    <Card className="glass-card p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FilterSection
          title="Education"
          filters={[
            { label: "University", options: filterOptions.universities },
            { label: "Major", options: filterOptions.majors },
            { label: "Graduation Year", options: filterOptions.gradYears },
          ]}
        />
        <FilterSection
          title="Experience"
          filters={[
            { label: "Type", options: ["Internship", "Full-time"] },
            { label: "Skills", options: skillsList, multiSelect: true },
          ]}
        />
      </div>
      <div>
        <h3 className="font-medium mb-3">Culture Tags</h3>
        <div className="flex flex-wrap gap-2">
          {cultureTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
              className="transition-all duration-200"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button size="lg">
          Find Candidates
        </Button>
      </div>
    </Card>
  );
};

export default GuidedSearch;
