"use client";

import React, { useState } from "react";
import { Client, Databases, ID } from "appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";

// Access environment variables from Next.js
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID;
const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID;

// EmailJS credentials from your EmailJS dashboard
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_USER_ID = process.env.NEXT_PUBLIC_EMAILJS_USER_ID;

if (
  !endpoint ||
  !projectId ||
  !databaseId ||
  !collectionId ||
  !EMAILJS_SERVICE_ID ||
  !EMAILJS_TEMPLATE_ID ||
  !EMAILJS_USER_ID
) {
  console.error("One or more environment variables are missing.");
}

const client = new Client().setEndpoint(endpoint).setProject(projectId);

const databases = new Databases(client);

const info = [
  {
    icon: <FaPhoneAlt />,
    title: "Phone",
    description: "(+91) 90266-09991",
  },
  {
    icon: <FaEnvelope />,
    title: "Email",
    description: "ms.shadab06@gmail.com",
  },
  {
    icon: <FaMapMarkerAlt />,
    title: "Address",
    description: "Sitapur, Uttar Pradesh, India",
  },
];

const services = [
  "Frontend Development",
  "Backend Development",
  "Fullstack Development",
  "Other",
];

const Contact = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedService, setSelectedService] = useState("Select a service");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleCreateDocument = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneNumberError("Please enter a valid 10-digit phone number");
      setIsLoading(false);
      return;
    }

    try {
      const documentId = ID.unique();
      const response = await databases.createDocument(
        databaseId,
        collectionId,
        documentId,
        {
          firstname: firstName,
          lastname: lastName,
          message: message,
          email: email,
          phone: phoneNumber,
          service:
            selectedService === "Select a service" ? null : selectedService,
        }
      );

      // console.log("Document created:", response);

      // Send email using EmailJS
      const templateParams = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        selectedService: selectedService,
        message: message,
      };

      // Send email to the user
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          ...templateParams,
          to_email: email, // Ensure this parameter is correctly handled
        },
        EMAILJS_USER_ID
      );

      // console.log("Email sent successfully");

      setFirstName("");
      setLastName("");
      setMessage("");
      setEmail("");
      setPhoneNumber("");
      setPhoneNumberError("");
      setSelectedService("Select a service");
    } catch (error) {
      console.error("Error creating document or sending email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 2.4, duration: 0.4, ease: "easeIn" },
      }}
      className="py-6"
    >
      <div className="container mx-auto">
        <div className="flex flex-col xl:flex-row gap-[30px]">
          <div className="xl:w-[54%] order-2 xl:order-none">
            <form
              className="flex flex-col gap-6 p-10 bg-[#27272c] rounded-xl"
              onSubmit={handleCreateDocument}
            >
              <h3 className="text-4xl text-accent">Let's work together</h3>
              <p className="text-white/60">
                If you've made it this far, please feel free to leave a message
                or suggestion. Additionally, if you're interested in hiring me,
                please fill out the form below.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  placeholder="Firstname"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="Lastname"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Phone number"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                />

                {phoneNumberError && (
                  <p style={{ color: "red" }}>{phoneNumberError}</p>
                )}
              </div>
              <Select
                value={selectedService}
                onValueChange={(value) => setSelectedService(value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {selectedService || "Select a service"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {services.map((service, index) => (
                      <SelectItem key={index} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Textarea
                className="h-[200px]"
                placeholder="Leave your message or suggestion here."
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />

              <Button
                size="md"
                className="max-w-40"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
          <div className="flex-1 flex items-center xl:justify-end order-1 xl:order-none mb-8 xl:mb-0">
            <ul className="flex flex-col gap-10">
              {info.map((item, index) => (
                <li key={index} className="flex items-center gap-6">
                  <div className="w-[52px] h-[52px] xl:w-[72px] xl:h-[72px] bg-[#27272c] text-accent rounded-md flex items-center justify-center">
                    <div className="text-[28px]">{item.icon}</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60">{item.title}</p>
                    <h3 className="text-xl">{item.description}</h3>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Contact;
