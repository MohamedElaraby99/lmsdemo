import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqData = [
  {
    id: 1,
    question: "How do I get started with the courses?",
    answer: "Getting started is easy! Simply create an account, browse our course catalog, and enroll in courses that interest you. You can start learning immediately after enrollment. All courses are self-paced, so you can learn at your own speed."
  },
  {
    id: 2,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and digital wallets including PayPal, Apple Pay, and Google Pay. All payments are processed securely through our trusted payment partners. We also offer installment plans for some courses."
  },
  {
    id: 3,
    question: "Can I access courses offline?",
    answer: "Currently, our courses are available online only for the best learning experience. However, you can download course materials, PDFs, and resources for offline reference. We're working on offline video downloads for premium members."
  },
  {
    id: 4,
    question: "Do you offer certificates upon completion?",
    answer: "Yes! Upon completion of a course, you'll receive a professional certificate that you can download and share on your LinkedIn profile, resume, or portfolio. Our certificates are recognized by employers worldwide."
  },
  {
    id: 5,
    question: "What if I'm not satisfied with a course?",
    answer: "We offer a 30-day money-back guarantee for all courses. If you're not completely satisfied with your learning experience, simply contact our support team within 30 days of purchase for a full refund."
  },
  {
    id: 6,
    question: "How do I get help if I have technical issues?",
    answer: "Our support team is available 24/7 to help you with any technical issues. You can reach us through live chat, email, or our community forum. We also have a comprehensive help center with tutorials and guides."
  },
  {
    id: 7,
    question: "Are the courses suitable for beginners?",
    answer: "Absolutely! We offer courses for all skill levels - from complete beginners to advanced professionals. Each course clearly indicates the required skill level, and many include prerequisite information to help you choose the right course."
  },
  {
    id: 8,
    question: "Can I interact with instructors and other students?",
    answer: "Yes! Our platform includes discussion forums, live Q&A sessions, and direct messaging with instructors. You can also join study groups and participate in community challenges to enhance your learning experience."
  }
];

const FAQItem = ({ item, isOpen, onToggle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <button
        onClick={() => onToggle(item.id)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white pr-4">
          {item.question}
        </h3>
        <div className="flex-shrink-0">
          {isOpen ? (
            <FaChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform duration-200" />
          ) : (
            <FaChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200" />
          )}
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-4">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {item.answer}
            </p>
            {isOpen && (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Helpful answer</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQAccordion = () => {
  const [openItems, setOpenItems] = useState(new Set([1])); // First item open by default
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleItem = (itemId) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  const toggleShowAll = () => {
    if (showAll) {
      setOpenItems(new Set([1])); // Keep only first item open
    } else {
      setOpenItems(new Set(faqData.map(item => item.id))); // Open all items
    }
    setShowAll(!showAll);
  };

  // Filter FAQ items based on search term
  const filteredItems = faqData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedItems = showAll ? filteredItems : filteredItems.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search FAQ questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {displayedItems.length > 0 ? (
        <>
          {displayedItems.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              isOpen={openItems.has(item.id)}
              onToggle={toggleItem}
            />
          ))}
          
          {filteredItems.length > 4 && (
            <div className="text-center pt-4">
              <button
                onClick={toggleShowAll}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
              >
                {showAll ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Show Less
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show All Questions
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No questions found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search terms or browse all questions below.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default FAQAccordion; 