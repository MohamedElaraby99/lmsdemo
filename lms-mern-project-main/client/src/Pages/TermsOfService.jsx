import React from "react";
import Layout from "../Layout/Layout";
import { FaShieldAlt, FaUserCheck, FaHandshake, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from "react-icons/fa";

export default function TermsOfService() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <FaShieldAlt className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using Fikra Software's learning platform
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
                  <FaInfoCircle className="mr-3 text-blue-600" />
                  Introduction
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Welcome to Fikra Software's Learning Management System. By accessing and using our platform, 
                  you agree to be bound by these Terms of Service. If you do not agree to these terms, 
                  please do not use our services.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  These terms apply to all users of the platform, including students, instructors, and administrators.
                </p>
              </section>

              {/* Account Registration */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaUserCheck className="mr-3 text-green-600" />
                  Account Registration
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      You must provide accurate, current, and complete information during registration.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      You are responsible for maintaining the confidentiality of your account credentials.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      You must be at least 5 years old to create an account.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      You are responsible for all activities that occur under your account.
                    </p>
                  </div>
                </div>
              </section>

              {/* Acceptable Use */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaHandshake className="mr-3 text-purple-600" />
                  Acceptable Use
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">You agree to:</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Use the platform for educational purposes only
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Respect other users and maintain a positive learning environment
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Not share inappropriate, offensive, or harmful content
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Not attempt to gain unauthorized access to the platform
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Not use automated systems to access the platform
                    </li>
                  </ul>
                </div>
              </section>

              {/* Content and Intellectual Property */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Content and Intellectual Property
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    All content on this platform, including courses, materials, and software, 
                    is owned by Fikra Software or its licensors and is protected by copyright laws.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    You may not reproduce, distribute, or create derivative works without explicit permission.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    User-generated content remains your property, but you grant us a license to use it 
                    for platform improvement and educational purposes.
                  </p>
                </div>
              </section>

              {/* Privacy and Data Protection */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Privacy and Data Protection
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    We are committed to protecting your privacy. Our data collection and usage practices 
                    are outlined in our Privacy Policy.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    We collect personal information including name, email, phone numbers, location, 
                    and educational details to provide our services effectively.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Your data is stored securely and will not be shared with third parties without your consent, 
                    except as required by law.
                  </p>
                </div>
              </section>

              {/* Payment and Subscriptions */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Payment and Subscriptions
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Some features may require payment. All fees are clearly stated before purchase.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Payments are processed securely through our payment partners.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Refunds are handled according to our refund policy, available upon request.
                  </p>
                </div>
              </section>

              {/* Termination */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Account Termination
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    You may terminate your account at any time by contacting our support team.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    We reserve the right to suspend or terminate accounts that violate these terms.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Upon termination, your access to the platform will be revoked, 
                    but your data will be retained as required by law.
                  </p>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Limitation of Liability
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Fikra Software provides educational content and services "as is" without warranties.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    We are not liable for any indirect, incidental, or consequential damages.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Our total liability is limited to the amount you paid for our services.
                  </p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Changes to Terms
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    We may update these terms from time to time. Changes will be posted on this page.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Continued use of the platform after changes constitutes acceptance of new terms.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    If you have questions about these terms, please contact us:
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
                  By using Fikra Software's platform, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 