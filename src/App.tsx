/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar, { NavSection } from './components/Navbar';
import SakuraCanvas from './components/SakuraCanvas';
import Hero from './components/Hero';
import HomeSections from './components/HomeSections';
import AboutSection from './components/AboutSection';
import CultureSection from './components/CultureSection';
import FacultySection from './components/FacultySection';
import EventsSection from './components/EventsSection';
import LanguageSection from './components/LanguageSection';
import GallerySection from './components/GallerySection';
import AnnouncementsSection from './components/AnnouncementsSection';
import JoinSection from './components/JoinSection';
import ContactSection from './components/ContactSection';
import JlptStudentPortal from './components/JlptStudentPortal';
import AdminPortalAuth from './components/AdminPortalAuth';
import FacultyControlCenter from './components/FacultyControlCenter';
import Footer from './components/Footer';
import { ClubEvent } from './data/clubData';
import { api, getStoredToken } from './services/api';

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('home');
  const [isPetalsActive, setIsPetalsActive] = useState<boolean>(true);
  const [selectedEventForModal, setSelectedEventForModal] = useState<ClubEvent | null>(null);

  // Auth & Admin State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check stored session on mount
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      api.getMe()
        .then((res) => {
          if (res?.user) {
            setCurrentUser(res.user);
          }
        })
        .catch(() => {
          // Token expired or invalid
          setCurrentUser(null);
        });
    }
  }, []);

  // Sync section with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavSection;
      const validSections: NavSection[] = [
        'home',
        'about',
        'culture',
        'faculty',
        'events',
        'language',
        'jlpt',
        'gallery',
        'announcements',
        'join',
        'contact',
        'admin'
      ];
      if (validSections.includes(hash)) {
        if (hash === 'admin') {
          // If not logged in, prompt auth modal
          if (!currentUser && !getStoredToken()) {
            setIsAuthModalOpen(true);
          } else {
            setCurrentSection('admin');
          }
        } else {
          setCurrentSection(hash);
        }
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  const handleNavigate = (section: NavSection) => {
    if (section === 'admin') {
      if (currentUser) {
        setCurrentSection('admin');
        window.location.hash = 'admin';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setIsAuthModalOpen(true);
      }
      return;
    }

    setCurrentSection(section);
    window.location.hash = section === 'home' ? '' : section;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEventFromHome = (event: ClubEvent) => {
    setSelectedEventForModal(event);
    setCurrentSection('events');
    window.location.hash = 'events';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setCurrentSection('admin');
    window.location.hash = 'admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentSection('home');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin Section and authenticated, render Faculty/Admin Control Center
  if (currentSection === 'admin' && currentUser) {
    return (
      <div className="relative min-h-screen bg-[#080A12] text-[#F5EBDD] font-sans antialiased">
        <FacultyControlCenter
          user={currentUser}
          onLogout={handleLogout}
          onReturnToSite={() => handleNavigate('home')}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#080A12] text-[#F5EBDD] font-sans antialiased overflow-x-hidden">
      {/* Floating Cherry Blossom Petals Canvas */}
      <SakuraCanvas isEnabled={isPetalsActive} />

      {/* Global Top Navbar */}
      <Navbar
        currentSection={currentSection}
        onNavigate={handleNavigate}
        isPetalsActive={isPetalsActive}
        onTogglePetals={() => setIsPetalsActive((prev) => !prev)}
      />

      {/* Dynamic View Content */}
      <main className="w-full">
        {currentSection === 'home' && (
          <>
            <Hero onNavigate={handleNavigate} />
            <HomeSections
              onNavigate={handleNavigate}
              onSelectEvent={handleSelectEventFromHome}
            />
          </>
        )}

        {currentSection === 'about' && (
          <AboutSection onNavigate={handleNavigate} />
        )}

        {currentSection === 'culture' && (
          <CultureSection />
        )}

        {currentSection === 'faculty' && (
          <FacultySection onNavigate={handleNavigate} />
        )}

        {currentSection === 'events' && (
          <EventsSection
            selectedEventForModal={selectedEventForModal}
            onClearModalEvent={() => setSelectedEventForModal(null)}
          />
        )}

        {currentSection === 'language' && (
          <LanguageSection />
        )}

        {currentSection === 'jlpt' && (
          <JlptStudentPortal onNavigateHome={() => handleNavigate('home')} />
        )}

        {currentSection === 'gallery' && (
          <GallerySection />
        )}

        {currentSection === 'announcements' && (
          <AnnouncementsSection />
        )}

        {currentSection === 'join' && (
          <JoinSection />
        )}

        {currentSection === 'contact' && (
          <ContactSection />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Admin Portal Authentication Modal */}
      <AdminPortalAuth
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
