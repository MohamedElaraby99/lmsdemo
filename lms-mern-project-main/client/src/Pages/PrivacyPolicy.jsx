import React from "react";
import Layout from "../Layout/Layout";
import { FaShieldAlt, FaDatabase, FaEye, FaLock, FaUserSecret, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <FaShieldAlt className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              How we collect, use, and protect your personal information
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaInfoCircle className="mr-3 text-purple-600" />
                  Introduction
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Fikra Software ("we," "our," or "us") is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                  when you use our learning management platform.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  By using our services, you consent to the data practices described in this policy.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaDatabase className="mr-3 text-blue-600" />
                  Information We Collect
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Full name and contact information</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Email address and phone numbers</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Age and educational details</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Geographic location (governorate)</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Profile picture and avatar</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Usage Information</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Course progress and completion data</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Learning preferences and interactions</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Device information and IP addresses</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Usage patterns and analytics</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaEye className="mr-3 text-green-600" />
                  How We Use Your Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      Provide and maintain our educational services
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      Personalize your learning experience and recommendations
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      Communicate with you about your account and services
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      Improve our platform and develop new features
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      Ensure platform security and prevent fraud
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      Comply with legal obligations and regulations
                    </p>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaUserSecret className="mr-3 text-orange-600" />
                  Information Sharing
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    We do not sell, trade, or rent your personal information to third parties. 
                    We may share your information in the following circumstances:
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start">
                        <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                        <span>With your explicit consent</span>
                      </li>
                      <li className="flex items-start">
                        <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                        <span>To comply with legal requirements</span>
                      </li>
                      <li className="flex items-start">
                        <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                        <span>With trusted service providers who assist in platform operation</span>
                      </li>
                      <li className="flex items-start">
                        <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                        <span>To protect our rights and safety</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaLock className="mr-3 text-green-600" />
                  Data Security
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    We implement appropriate technical and organizational measures to protect your personal information:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Encryption</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        All data is encrypted in transit and at rest using industry-standard protocols.
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Access Control</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Strict access controls limit who can view your personal information.
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Regular Audits</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        We regularly review and update our security practices.
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Storage</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Data is stored on secure servers with multiple layers of protection.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Your Rights
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    You have the following rights regarding your personal information:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900 dark:text-white">Access:</strong>
                        <span className="text-gray-700 dark:text-gray-300 ml-2">
                          Request a copy of your personal data
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900 dark:text-white">Correction:</strong>
                        <span className="text-gray-700 dark:text-gray-300 ml-2">
                          Update or correct inaccurate information
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900 dark:text-white">Deletion:</strong>
                        <span className="text-gray-700 dark:text-gray-300 ml-2">
                          Request deletion of your personal data
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900 dark:text-white">Portability:</strong>
                        <span className="text-gray-700 dark:text-gray-300 ml-2">
                          Receive your data in a portable format
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900 dark:text-white">Objection:</strong>
                        <span className="text-gray-700 dark:text-gray-300 ml-2">
                          Object to certain processing activities
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Cookies and Tracking
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    We use cookies and similar technologies to enhance your experience:
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                      <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                      <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                      <li><strong>Security Cookies:</strong> Protect against fraud and abuse</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    You can control cookie settings through your browser preferences.
                  </p>
                </div>
              </section>

              {/* Children's Privacy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Children's Privacy
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Our platform is designed for users aged 5 and above. We collect information from children 
                    with parental consent and take special care to protect their privacy.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Parents can review, delete, or refuse further collection of their child's information 
                    by contacting us directly.
                  </p>
                </div>
              </section>

              {/* International Transfers */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  International Data Transfers
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Your information may be transferred to and processed in countries other than Egypt. 
                    We ensure appropriate safeguards are in place to protect your data during such transfers.
                  </p>
                </div>
              </section>

              {/* Changes to Privacy Policy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Changes to This Privacy Policy
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    We may update this Privacy Policy from time to time. We will notify you of any changes 
                    by posting the new policy on this page and updating the "Last updated" date.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    We encourage you to review this policy periodically for any changes.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Contact Us
                </h2>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    If you have questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="space-y-1 text-gray-700 dark:text-gray-300">
                    <p><strong>Email:</strong> softwarefikra@gmail.com</p>
                    <p><strong>Phone:</strong> +201207039410</p>
                    <p><strong>Address:</strong> Mansoura, 18 Street Torel, Egypt</p>
                    <p><strong>Website:</strong> https://fikra.solutions/</p>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  By using Fikra Software's platform, you acknowledge that you have read and understood 
                  this Privacy Policy and consent to our data practices as described herein.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 