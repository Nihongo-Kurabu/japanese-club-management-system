
import { useEffect } from 'react';

import {
  Globe,
  Mail,
  X,
  ExternalLink,
  Award,
  BriefcaseBusiness,
  GraduationCap,
  Github
} from 'lucide-react';

import {
  FaGithub,
  FaLinkedin,
  FaInstagram
} from 'react-icons/fa';

import type { TeamMember } from '../data/clubData';

interface LeadershipProfileModalProps {
  member: TeamMember | null;
  onClose: () => void;
}

export default function LeadershipProfileModal({
  member,
  onClose
}: LeadershipProfileModalProps) {

  // Lock background scrolling and support Escape key
  useEffect(() => {
    if (!member) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [member, onClose]);

  if (!member) return null;

  const profile = member.profile;

  // Social links: all five options are always displayed
  const socials = [
    {
      label: 'GitHub',
      href: profile?.socials?.github,
      Icon: FaGithub
    },
    {
      label: 'LinkedIn',
      href: profile?.socials?.linkedin,
      Icon: FaLinkedin
    },
    {
      label: 'Portfolio',
      href: profile?.socials?.portfolio,
      Icon: Globe
    },
    {
      label: 'Instagram',
      href: profile?.socials?.instagram,
      Icon: FaInstagram
    },
    {
      label: 'Email',
      href: profile?.socials?.email
        ? `mailto:${profile.socials.email}`
        : undefined,
      Icon: Mail
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leadership-profile-name"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-[#111522] border border-white/10 shadow-2xl"
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close profile"
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 border border-white/10 text-white hover:bg-[#E63946] transition-all"
        >
          <X size={20} />
        </button>

        {/* Profile Header */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">

          {/* Member Image */}
          <div className="relative h-64 sm:h-80 md:h-full min-h-[300px] overflow-hidden">

            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#111522] via-transparent to-transparent" />

            <div className="absolute bottom-5 left-5">

              <span className="px-3 py-1 rounded-full bg-[#E63946] text-white text-[10px] font-mono">
                {member.category === 'senpai'
                  ? 'SENPAI MENTOR'
                  : 'CLUB LEADERSHIP'}
              </span>

              <h2
                id="leadership-profile-name"
                className="text-3xl font-bold text-white mt-3"
              >
                {member.name}
              </h2>

              <p className="text-[#53D8F0] mt-1">
                {member.japaneseName}
              </p>

            </div>
          </div>

          {/* Member Information */}
          <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">

            <span className="text-xs font-mono tracking-widest text-[#53D8F0] uppercase">
              Member Profile • メンバープロフィール
            </span>

            {/* Roles */}
            <div className="mt-5 space-y-2">

              {member.roles.map((role, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-start text-sm text-[#E63946] font-semibold"
                >
                  <Award size={17} className="shrink-0 mt-0.5" />
                  {role}
                </div>
              ))}

            </div>

            {/* About */}
            <h3 className="text-lg font-bold text-white mt-7 mb-2">
              About Me
            </h3>

            <p className="text-sm text-[#A6ADBD] leading-7">
              {profile?.about || member.bio}
            </p>

            {/* Education */}
            {profile?.education && (
              <div className="mt-6">

                <div className="flex items-center gap-2 text-[#53D8F0] mb-2">
                  <GraduationCap size={17} />

                  <h3 className="text-sm font-bold">
                    Education
                  </h3>
                </div>

                <p className="text-sm text-[#A6ADBD]">
                  {profile.education}
                </p>

              </div>
            )}

          </div>
        </div>

        {/* Responsibilities */}
        {profile?.responsibilities?.length ? (
          <div className="px-6 sm:px-10 py-7 border-t border-white/10">

            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
              Responsibilities
            </h3>

            <div className="space-y-3">

              {profile.responsibilities.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 text-sm text-[#A6ADBD]"
                >
                  <span className="text-[#E63946]">✦</span>
                  {item}
                </div>
              ))}

            </div>
          </div>
        ) : null}

        {/* Skills & Interests */}
        <div className="px-6 sm:px-10 py-7 border-t border-white/10">

          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
            Skills & Interests
          </h3>

          <div className="flex flex-wrap gap-2">

            {member.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#A6ADBD] text-xs font-mono"
              >
                {tag}
              </span>
            ))}

          </div>
        </div>

        {/* Achievements */}
        {profile?.achievements?.length ? (
          <div className="px-6 sm:px-10 py-7 border-t border-white/10">

            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
              Achievements
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">

              {profile.achievements.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-3"
                >
                  <Award
                    size={18}
                    className="text-[#E63946] shrink-0"
                  />

                  <p className="text-sm text-[#A6ADBD]">
                    {item}
                  </p>
                </div>
              ))}

            </div>
          </div>
        ) : null}

        {/* Projects */}
        {profile?.projects?.length ? (
          <div className="px-6 sm:px-10 py-7 border-t border-white/10">

            <div className="flex items-center gap-2 mb-5">

              <BriefcaseBusiness
                size={18}
                className="text-[#53D8F0]"
              />

              <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                Projects & Contributions
              </h3>

            </div>

            <div className="grid sm:grid-cols-2 gap-4">

              {profile.projects.map((project, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl bg-[#171C2B] border border-white/10 hover:border-[#7652D6]/60 transition-all"
                >

                  <h4 className="text-white font-bold">
                    {project.name}
                  </h4>

                  <p className="text-sm text-[#A6ADBD] mt-3 leading-relaxed">
                    {project.description}
                  </p>

                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-xs text-[#53D8F0] hover:text-white"
                    >
                      View Project
                      <ExternalLink size={13} />
                    </a>
                  )}

                </div>
              ))}

            </div>
          </div>
        ) : null}

        {/* Social Links */}
        <div className="px-6 sm:px-10 py-7 border-t border-white/10">

          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
            Connect With Me
          </h3>

          <div className="flex flex-wrap gap-3">

            {socials.map(({ label, href, Icon }) => {

              const isAvailable = Boolean(href?.trim());

              return (
                <a
                  key={label}
                  href={isAvailable ? href : undefined}
                  target={
                    label === 'Email'
                      ? undefined
                      : '_blank'
                  }
                  rel="noopener noreferrer"
                  aria-disabled={!isAvailable}
                  onClick={(event) => {
                    if (!isAvailable) {
                      event.preventDefault();
                    }
                  }}
                  title={
                    isAvailable
                      ? `Visit ${label}`
                      : `${label} link not added yet`
                  }
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl
                    border text-xs transition-all
                    ${
                      isAvailable
                        ? 'bg-white/5 border-white/10 text-white hover:bg-[#E63946]/20 hover:border-[#E63946]/50 cursor-pointer'
                        : 'bg-white/[0.02] border-white/5 text-[#777F90] opacity-60 cursor-not-allowed'
                    }
                  `}
                >

                  <Icon
                    size={17}
                    className={
                      isAvailable
                        ? 'text-[#53D8F0]'
                        : 'text-[#777F90]'
                    }
                  />

                  <span>{label}</span>

                  {isAvailable ? (
                    <ExternalLink size={12} />
                  ) : (
                    <span className="text-[9px]">
                      Not added
                    </span>
                  )}

                </a>
              );

            })}

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-10 py-5 border-t border-white/10 bg-[#080A12]/50 flex justify-between items-center">

          <span className="text-xs text-[#A6ADBD] font-mono">
            JAPANESE CLUB • 2026/27
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-[#E63946] text-white text-xs font-bold hover:bg-[#c92e3a] transition-all"
          >
            CLOSE PROFILE
          </button>

        </div>

      </div>
    </div>
  );
}
