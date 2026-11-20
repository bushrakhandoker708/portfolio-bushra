import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, useInView } from "framer-motion";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { FaCheck, FaChevronDown, FaTrophy, FaAward, FaStar, FaAngleDoubleDown, FaAngleDoubleUp } from "react-icons/fa";

const achievements = [
  // TODO: add a "University" entry first: CGPA, class rank, scholarships, RA/TA roles, ML competitions.
  {
    title: "Academic Record",
    description: "National-level academic results before university.",
    icon: FaTrophy,
    color: "from-aquamarine to-jordy_blue",
    points: [
      "Ranked 31st in the BUET admission test (Architecture), 2023",
      "HSC: GPA 5.00 (Science), General Grade Scholarship and Higher Secondary Completion Award (PBGSI), 2023",
      "SSC: GPA 5.00, Talent Pool Scholarship, 2021"
    ]
  },
  {
    title: "Mathematics & Physics Olympiads",
    description: "Competitive problem solving in mathematics and physics.",
    icon: FaStar,
    color: "from-jordy_blue to-electric_blue",
    points: [
      "Bangladesh Physics Olympiad: 1st place, Jessore regional round; National Round participant (2023)",
      "Bangladesh Math Olympiad: Regional winner; National Round participant (2020)",
      "International Youth Math Challenge: Qualification Round winner (2024)"
    ]
  },
  {
    title: "Early Research & Projects",
    description: "First hands-on work applying computing and science to real problems.",
    icon: FaAward,
    color: "from-pink_lavender to-electric_blue",
    points: [
      "Team lead, Gusto: a virtual assistant with face recognition and data analysis. Best Project, Interhouse Science Fair (2022)",
      "Biggan Uthsob (national science festival): Regional winner with a biodegradable polythene project; National Round participant (2019)"
    ]
  },
  {
    title: "Leadership & Service",
    description: "Building teams and communities.",
    icon: FaStar,
    color: "from-jordy_blue to-lemon_chiffon",
    points: [
      "Founder and Vice President, EmpowerEd: non-profit expanding educational access; led strategy and fundraising",
      "House Prefect: led 92 cadets; house won the 2023 Overall Athletics Championship",
      "Tutored secondary students in physics and mathematics"
    ]
  },
  {
    title: "Technical Skills",
    description: "Languages and tools I work with.",
    icon: FaTrophy,
    color: "from-tea_rose to-lemon_chiffon",
    points: [
      "Programming: Python, C, C++",
      "Machine learning with Python", // TODO: list the libraries you actually use (PyTorch, scikit-learn, ...)
      "Web and visualisation: JavaScript, React, Three.js, Firebase",
      "3D modelling and physics simulation in Blender"
    ]
  }
];

/**
 * Animated Icon Component
 */
const AnimatedIcon = memo(({ achievement }) => {
  const IconComponent = achievement.icon;
  
  return (
    <motion.div
      className={`w-16 h-16 flex items-center justify-center bg-gradient-to-br ${achievement.color} rounded-full text-white shadow-lg relative overflow-hidden`}
      whileHover={{ 
        scale: 1.1,
        rotate: [0, -10, 10, -10, 0],
        transition: { 
          scale: { duration: 0.2 },
          rotate: { duration: 0.6 }
        }
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: 0.1
      }}
      aria-hidden
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      
      {/* Icon with pulse animation */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10"
      >
        <IconComponent className="text-2xl" />
      </motion.div>
      
      {/* Sparkle effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
        animate={{ 
          x: [-100, 100],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </motion.div>
  );
}, (prevProps, nextProps) => prevProps.achievement.title === nextProps.achievement.title);

/**
 * List animation variants
 */
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

/**
 * AchievementCard with controlled expansion
 */
const AchievementCard = memo(({ achievement, isMobile, index, isExpanded, onToggle }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, margin: "-50px" });
  const panelId = `achievement-panel-${index}`;

  return (
    <VerticalTimelineElement
      ref={cardRef}
      className="achievement-card group"
      contentStyle={{
        background: "rgba(15,23,42,0.4)",
        backdropFilter: "blur(12px)",
        borderRadius: "1.5rem",
        padding: isMobile ? "1.5rem" : "2rem",
        border: "1px solid rgba(148, 163, 184, 0.4)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        position: "relative",
        zIndex: 1,
      }}
      contentArrowStyle={{
        borderRight: `7px solid rgba(${achievement.color.includes('yellow') ? '251, 191, 36' : '148, 163, 184'}, 0.3)`
      }}
      iconStyle={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none'
      }}
      icon={<AnimatedIcon achievement={achievement} />}
      aria-label={`${achievement.title} card`}
    >
      {/* Toggle header */}
      <motion.div
        className="cursor-pointer relative z-10"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggle())}
        aria-expanded={isExpanded}
        aria-controls={panelId}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className={
            `font-bold bg-gradient-to-r ${achievement.color} bg-clip-text text-transparent ${isMobile ? "text-xl" : "text-2xl lg:text-3xl"} tracking-tight leading-tight flex-1 pr-4`
          }>
            {achievement.title}
          </h3>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex-shrink-0"
            aria-hidden
          >
            <FaChevronDown className={`${isMobile ? "text-lg" : "text-xl"} text-slate-400 group-hover:text-slate-300 transition-colors duration-200`} />
          </motion.div>
        </div>

        <p className={
          `tracking-wide text-slate-300 leading-relaxed ${isMobile ? "text-sm" : "text-base lg:text-lg"} group-hover:text-white transition-colors duration-300`
        }>
          {achievement.description}
        </p>
      </motion.div>

      {/* Expandable content */}
      <motion.div
        layout="position"
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? 20 : 0
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
          opacity: { duration: 0.3 }
        }}
        className="relative z-10 overflow-hidden"
        id={panelId}
        role="region"
        aria-label={`${achievement.title} details`}
      >
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate={isExpanded ? "visible" : "hidden"}
          className="space-y-3"
        >
          {achievement.points.map((point, pointIndex) => (
            <motion.li
              key={pointIndex}
              variants={itemVariants}
              className={`flex items-start space-x-3 text-slate-200 ${isMobile ? "text-xs" : "text-sm lg:text-base"} leading-relaxed`}
            >
              <div className={`flex items-center justify-center w-5 h-5 mt-0.5 text-white rounded-full bg-gradient-to-r ${achievement.color} shadow-md flex-shrink-0`} aria-hidden>
                <FaCheck className="text-xs" />
              </div>
              <span className="tracking-wide">{point}</span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </VerticalTimelineElement>
  );
}, (prevProps, nextProps) =>
  prevProps.achievement.title === nextProps.achievement.title &&
  prevProps.isMobile === nextProps.isMobile &&
  prevProps.index === nextProps.index &&
  prevProps.isExpanded === nextProps.isExpanded
);

/**
 * Achievements Section with Expand All button
 */
const Achievements = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const resizeTimeout = useRef();

  // Ensure viewport meta tag is properly set
  useEffect(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(meta);
    } else if (viewportMeta.content.includes('user-scalable=no')) {
      viewportMeta.content = 'width=device-width, initial-scale=1.0';
    }
  }, []);

  // Ensure body overflow is not hidden
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
    return () => {
      if (originalOverflow) {
        document.body.style.overflow = originalOverflow;
      }
    };
  }, []);

  // Optimized resize handler
  useEffect(() => {
    const handleResize = () => {
      clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout.current);
    };
  }, []);

  // Simple title animation only
  useEffect(() => {
    if (!titleRef.current) return;
    
    const titleElements = titleRef.current.children;
    Array.from(titleElements).forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(50px)';
      
      setTimeout(() => {
        element.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 200);
    });
  }, []);

  // Toggle individual card
  const toggleCard = useCallback((index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  // Toggle all cards
  const toggleAllCards = useCallback(() => {
    const newExpandedState = !allExpanded;
    const newExpandedCards = {};
    achievements.forEach((_, index) => {
      newExpandedCards[index] = newExpandedState;
    });
    setExpandedCards(newExpandedCards);
    setAllExpanded(newExpandedState);
  }, [allExpanded]);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Accomplishments",
    "itemListElement": achievements.map((a, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "CreativeWork",
        "name": a.title,
        "description": a.description
      }
    }))
  };

  return (
    <section
      ref={sectionRef}
      id="achievements"
      className="relative min-h-[200vh] bg-transparent"
      role="region"
      aria-labelledby="achievements-heading"
    >
      {/* SEO & Metadata */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      {/* Skip link for accessibility */}
      <a href="#achievements-timeline" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded-lg focus:z-50">
        Skip to achievements timeline
      </a>

      <motion.div
        className="relative z-10 container mx-auto px-4 py-16 lg:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16 lg:mb-20">
          <motion.h2
            id="achievements-heading"
            className={
              `font-extrabold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent ${isMobile ? "text-4xl mb-6" : "text-5xl lg:text-6xl mb-8"} tracking-tight leading-tight`
            }
            style={{ backgroundSize: "200% 200%" }}
          >
            Accomplishments
          </motion.h2>

          <motion.div
            className="w-24 h-1.5 bg-gradient-to-r from-teal-400 via-blue-400 to-cyan-400 rounded-full mx-auto mb-6 lg:mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            aria-hidden
          />

          <motion.p
            className={
              `text-slate-300 tracking-wide leading-relaxed max-w-3xl mx-auto ${isMobile ? "text-sm px-4" : "text-base lg:text-lg px-6"}`
            }
          >
            Behind every milestone is a story of curiosity, late nights, and a stubborn refusal to settle for "good enough." From solving tricky problems in STEM competitions to leading teams and building projects that help others, each achievement is a snapshot of moments where effort met imagination. This timeline isn't just a record of what I've done—it's a reflection of the challenges I've embraced, the skills I've honed, and the ways I've tried to leave a mark.
          </motion.p>

 {/* Expand/Collapse All Button - Styled like Hero Buttons */}
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <motion.button
              onClick={(e) => {
                toggleAllCards();
                // Ripple effect
                const rect = e.currentTarget.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                const ripple = document.createElement("span");
                ripple.style.position = "absolute";
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.style.background = "rgba(255, 255, 255, 0.3)";
                ripple.style.borderRadius = "50%";
                ripple.style.pointerEvents = "none";
                ripple.style.transform = "scale(0)";
                ripple.style.opacity = "1";
                ripple.style.transition = "transform 0.6s ease-out, opacity 0.6s ease-out";

                e.currentTarget.appendChild(ripple);

                setTimeout(() => {
                  ripple.style.transform = "scale(2)";
                  ripple.style.opacity = "0";
                }, 0);

                setTimeout(() => ripple.remove(), 600);
              }}
              className={`relative ${isMobile ? "px-6 py-3 text-base" : "px-8 py-3 text-lg"} font-semibold text-white tracking-wider rounded-full backdrop-blur-lg bg-gradient-to-r from-jordy_blue/40 to-electric_blue/40 border-2 border-lemon_chiffon hover:border-aquamarine overflow-hidden transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-jordy_blue font-cta flex items-center gap-3`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={allExpanded ? "Collapse all achievements" : "Expand all achievements"}
              style={{ pointerEvents: "auto" }}
            >
              {/* Animated icon */}
              <motion.div
                animate={{ 
                  rotate: allExpanded ? 180 : 0,
                }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"
                }}
              >
                {allExpanded ? (
                  <FaAngleDoubleUp className={isMobile ? "text-xl" : "text-2xl"} />
                ) : (
                  <FaAngleDoubleDown className={isMobile ? "text-xl" : "text-2xl"} />
                )}
              </motion.div>
              
              {/* Button text */}
              <span>
                {allExpanded ? "Collapse All" : "Expand All"}
              </span>
            </motion.button>
          </motion.div>        
          </div>

        {/* Timeline wrapper with Framer Motion */}
        <motion.div
          className="relative min-h-screen"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <nav aria-label="Achievements timeline navigation">
            <VerticalTimeline
              lineColor="rgba(163, 196, 243, 0.6)"
              className="before:bg-gradient-to-b before:from-blue-400/30 before:to-purple-400/30"
              id="achievements-timeline"
              style={{ contain: 'none' }}
            >
              {achievements.map((achievement, index) => (
                <AchievementCard
                  key={`${achievement.title}-${index}`}
                  achievement={achievement}
                  isMobile={isMobile}
                  index={index}
                  isExpanded={expandedCards[index] || false}
                  onToggle={() => toggleCard(index)}
                />
              ))}
            </VerticalTimeline>
          </nav>
        </motion.div>
      </motion.div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none w-[100vw]" aria-hidden />
      
      {/* Global styles */}
      <style jsx global>{`
        html, body {
          overflow-x: hidden;
          overflow-y: auto;
        }
        
        .vertical-timeline::before {
          background: linear-gradient(to bottom, rgba(163, 196, 243, 0.1), rgba(139, 92, 246, 0.1)) !important;
          width: 4px !important;
        }
        
        .achievement-card .vertical-timeline-element-content {
          position: relative;
          z-index: 1;
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
        }
        
        .vertical-timeline {
          contain: none !important;
        }
        
        .vertical-timeline-element {
          position: relative;
        }
        
        @media (max-width: 768px) {
          body {
            -webkit-overflow-scrolling: touch;
          }
        }
        
        .vertical-timeline-element-content {
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        .vertical-timeline-element-icon {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      `}</style>
    </section>
  );
};

export default memo(Achievements);