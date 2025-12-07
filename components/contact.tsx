"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hook";
import { sendEmail } from "@/actions/sendEmail";
import SubmitBtn from "./submit-btn";
import toast from "react-hot-toast";
import { BsLinkedin } from "react-icons/bs";
import { FaGithubSquare, FaBehanceSquare, FaYoutube } from "react-icons/fa";

export default function Contact() {
  const { ref } = useSectionInView("Contact");

  return (
    <section
      ref={ref}
      id="contact"
      className="scroll-mt-20 py-20 w-full min-h-[80vh] flex flex-col justify-center"
    >
      <SectionHeading>Get In Touch</SectionHeading>

      <div className="w-full max-w-5xl mx-auto px-4 mt-10 md:mt-20 font-mono">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="border-4 border-black dark:border-white bg-white dark:bg-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
        >
          {/* Terminal Header */}
          <div className="bg-black dark:bg-white text-white dark:text-black p-4 flex items-center justify-between border-b-4 border-black dark:border-white">
            <div className="flex gap-4">
              <div className="w-4 h-4 rounded-full bg-white dark:bg-black border-2 border-transparent"></div>
              <div className="w-4 h-4 rounded-full bg-white dark:bg-black border-2 border-transparent opacity-50"></div>
              <div className="w-4 h-4 rounded-full bg-white dark:bg-black border-2 border-transparent opacity-50"></div>
            </div>
            <div className="font-bold uppercase tracking-widest">contact_protocol.exe</div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>

          {/* Terminal Body */}
          <div className="p-8 md:p-12 text-black dark:text-white">
            {/* System Variables */}
            <div className="mb-12 space-y-2 opacity-70">
              <p>{`> INITIALIZING CONNECTION...`}</p>
              <p>{`> TARGET: ERIK HEIN`}</p>
              <p>{`> LOADING SYSTEM VARIABLES...`}</p>
              <div className="pl-4 border-l-2 border-black dark:border-white mt-4 space-y-1">
                <p>{`const EMAIL = "erikhein.ksth@gmail.com";`}</p>
                <p>{`const LOCATION = "San Francisco, CA";`}</p>
                <div className="flex flex-wrap gap-1">
                  <span>const SOCIALS = [</span>
                  <a href="https://www.linkedin.com/in/erikhein/" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">&quot;LinkedIn&quot;</a>,
                  <a href="https://github.com/erik-ksth" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">&quot;GitHub&quot;</a>,
                  <a href="https://www.youtube.com/@erik-hein" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">&quot;YouTube&quot;</a>,
                  <a href="https://www.behance.net/kaungsithu32" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">&quot;Behance&quot;</a>
                  <span>];</span>
                </div>
              </div>
              <p className="mt-4">{`> READY FOR INPUT.`}</p>
            </div>

            {/* Form */}
            <form
              className="space-y-8"
              action={async (formData) => {
                const { data, error } = await sendEmail(formData);

                if (error) {
                  toast.error(error);
                  return;
                }

                toast.success('Email sent successfully!');
              }}
            >
              <div className="space-y-2">
                <label htmlFor="senderEmail" className="block font-bold uppercase">
                  {`> ENTER SENDER EMAIL:`}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">$</span>
                  <input
                    id="senderEmail"
                    className="w-full bg-transparent border-b-2 border-black dark:border-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 py-2 font-bold placeholder:text-gray-400/50"
                    name="senderEmail"
                    type="email"
                    placeholder="user@example.com"
                    required
                    maxLength={500}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block font-bold uppercase">
                  {`> ENTER MESSAGE:`}
                </label>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-2">$</span>
                  <textarea
                    id="message"
                    className="w-full bg-transparent border-b-2 border-black dark:border-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 py-2 font-bold placeholder:text-gray-400/50 resize-none h-32"
                    name="message"
                    placeholder="Write your message here..."
                    required
                    maxLength={5000}
                  />
                </div>
              </div>

              <div className="pt-8">
                <SubmitBtn />
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
