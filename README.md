# Nandi Varun Reddy Portfolio

Admissions-focused portfolio website for Nandi Varun Reddy, a Computer Science and cybersecurity applicant from Telangana, India.

Live site: https://iam-varun2008.github.io/nandivarunreddy.github.io/

## Overview

This portfolio is designed for undergraduate university admissions. It presents academic performance, beginner cybersecurity projects, certificates, art, skills, and long-term goals in a serious but visually creative format.

The site includes:

- Language gate with English and Korean modes
- Animated one-page portfolio layout
- Education and marks summary
- CS50P, TryHackMe, and IELTS certificate cards
- Python cybersecurity project showcases with screenshots and demo videos
- Realistic graphite portrait section
- Skills and goals sections written for an admissions audience
- Minimal public contact details

## Main Sections

- Home
- About
- Education
- Certificates
- Projects
- Art
- Skills
- Goals
- Contact

## Projects Featured

### Log Analyzer & Threat Detector

Python defensive security project that analyzes Apache-style log files and identifies suspicious patterns such as repeated IP activity, admin access attempts, unusual status codes, and repeated failed requests.

Repository: https://github.com/iam-varun2008/Log-Analyzer-and-Threat-Detector

### Network Port Scanner & Basic Vulnerability Risk Reporter

Python educational security project for authorized testing environments. It checks open ports, identifies basic services, assigns simple risk levels, and provides beginner-friendly recommendations.

Repository: https://github.com/iam-varun2008/port-vulnerability-scanner

## File Structure

```text
public/
  certificates/
    cs50p-cert.pdf
    tryhackme-pre-security.pdf
    ielts-academic.pdf

  projects/
    log-analyzer-demo.mp4
    log-analyzer-report.png
    log-analyzer-results.png
    log-analyzer-structure.png
    log-analyzer-terminal.png
    port-scanner-demo.mp4
    port-scanner-report.png
    port-scanner-results.png
    port-scanner-structure.png
    port-scanner-terminal.png

  art/
    portrait-1.jpg
    portrait-2.jpg
    portrait-3.jpg
    portrait-4.jpg

  images/
    profile-photo.jpg
    cybersecurity-abstract.png
```

## Updating Assets

To make new files permanent on the live website, add them inside the correct `public/` folder and commit them to GitHub.

The in-page "Add Certificate" and "Add Photo" buttons are preview helpers. A static GitHub Pages website cannot permanently save uploads by itself, so final files must be placed in the repository and pushed.

## Privacy Choices

This portfolio intentionally avoids publishing:

- Phone number
- Home address
- Aadhaar, passport, or private ID documents
- Public marks memo PDFs
- Sensitive personal documents

Only admissions-relevant public information is shown.

## Tech Notes

The website is a static GitHub Pages site. The main page is `index.html`, with visual assets stored in `public/`.

Animations and interactions are handled directly in the page using browser-based React, Framer Motion, and custom canvas/CSS effects, so no build step is required for deployment.

## Contact

Email: 2008.varunreddy@gmail.com  
GitHub: https://github.com/iam-varun2008
