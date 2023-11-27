"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { experiencesData } from "@/lib/data";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { useSectionInView } from "@/lib/hook";
import { motion } from "framer-motion";

export default function Experience() {
  const { ref } = useSectionInView("Experience");

  return (
    <motion.section
      ref={ref}
      id="experience"
      className="scroll-mt-40 mb-20 sm:mb-40"
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      transition={{
        duration: 1,
      }}
      viewport={{
        once: true,
      }}
    >
      <SectionHeading>My Experience</SectionHeading>
      <Timeline position="alternate" className="!w-[100vw]">
        {experiencesData.map((item, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent
              sx={{ m: "auto 0" }}
              align="right"
              variant="body2"
              color="text.secondary"
              className="dark:!text-gray-300"
            >
              {item.date}
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineConnector className="!bg-gray-400 dark:!bg-gray-300" />
              <TimelineDot className="!w-6 !h-6 !m-1 !bg-blue-400 !shadow-none" />
              <TimelineConnector className="!bg-gray-400 dark:!bg-gray-300" />
            </TimelineSeparator>

            <TimelineContent className="!my-10">
              <h1 className="!text-blue-400">{item.title}</h1>
              <p className="!text-sm !text-gray-500 dark:!text-gray-300">{item.location}</p>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </motion.section>
  );
}
