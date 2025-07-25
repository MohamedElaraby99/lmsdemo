import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../Helpers/axiosInstance";
import { isEmail } from "../Helpers/regexMatcher";
import InputBox from "../Components/InputBox/InputBox";
import TextArea from "../Components/InputBox/TextArea";
import Layout from "../Layout/Layout";
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube,
  FaWhatsapp,
  FaTelegram,
  FaGlobe,
  FaClock,
  FaUser,
  FaComments
} from "react-icons/fa";

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState({
    name: "",
    email: "",
    message: "",
  });

  function handleInputChange(e) {
    const { name, value } = e.target;
    setUserInput({
      ...userInput,
      [name]: value,
    });
  }

  async function onFormSubmit(e) {
    e.preventDefault();
    if (!userInput.email || !userInput.name || !userInput.message) {
      toast.error("All fields are mandatory");
      return;
    }

    if (!isEmail(userInput.email)) {
      toast.error("Invalid email");
      return;
    }

    setIsLoading(true);
    const loadingMessage = toast.loading("Sending message...");
    try {
      const res = await axiosInstance.post("/contact", userInput);
      toast.success(res?.data?.message, { id: loadingMessage });
      setUserInput({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      toast.error("Message sending failed! Try again", { id: loadingMessage });
    } finally {
      setIsLoading(false);
    }
  }

  const contactInfo = {
    phone: "+201207039410",
    whatsapp: "+201207039410",
    email: "softwarefikra@gmail.com",
    support: "softwarefikra@gmail.com",
    address: "Mansoura, 18 Street Torel, Egypt",
    website: "https://fikra.solutions/",
    workingHours: "Monday - Friday: 9:00 AM - 6:00 PM"
  };

  const socialMedia = [
    { name: "Facebook", icon: FaFacebook, url: "https://www.facebook.com/people/Fikra-Software-%D9%81%D9%83%D8%B1%D8%A9/61572824761047/", color: "hover:text-blue-600" },
    { name: "LinkedIn", icon: FaLinkedin, url: "https://www.linkedin.com/company/fikra-software-%D9%81%D9%83%D8%B1%D8%A9-%D9%84%D9%84%D8%A8%D8%B1%D9%85%D8%AC%D9%8A%D8%A7%D8%AA/", color: "hover:text-blue-700" },
    { name: "WhatsApp", icon: FaWhatsapp, url: "https://wa.me/201207039410", color: "hover:text-green-500" },
    { name: "Website", icon: FaGlobe, url: "https://fikra.solutions/", color: "hover:text-purple-600" }
  ];

  return (
    <Layout>
      <section className="min-h-screen py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Contact Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Reach out to us through any of these channels. We're here to help!
                </p>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-4">
                    <FaPhone className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Phone</h3>
                    <a href={`tel:${contactInfo.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
                    <FaWhatsapp className="text-green-600 dark:text-green-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">WhatsApp</h3>
                    <a href={contactInfo.whatsapp} className="text-green-600 dark:text-green-400 hover:underline">
                      {contactInfo.whatsapp}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-4">
                    <FaEnvelope className="text-purple-600 dark:text-purple-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                    <a href={`mailto:${contactInfo.email}`} className="text-purple-600 dark:text-purple-400 hover:underline">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                {/* Support Email */}
                <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mr-4">
                    <FaComments className="text-orange-600 dark:text-orange-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Support</h3>
                    <a href={`mailto:${contactInfo.support}`} className="text-orange-600 dark:text-orange-400 hover:underline">
                      {contactInfo.support}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-4">
                    <FaMapMarkerAlt className="text-red-600 dark:text-red-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Address</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mr-4">
                    <FaClock className="text-indigo-600 dark:text-indigo-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Working Hours</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {contactInfo.workingHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-12 text-center">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
                  Follow Us
                </h3>
                <div className="flex flex-wrap justify-center gap-6 max-w-md mx-auto">
                  {socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${social.color} hover:scale-105`}
                      title={social.name}
                    >
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                        <social.icon className="text-2xl" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {social.name}
                      </span>
                </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Our Platform?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUser className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Expert Support</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    24/7 customer support to help you with any questions
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaGlobe className="text-2xl text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Global Community</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Connect with learners from around the world
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaComments className="text-2xl text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Response</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get answers to your questions within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
