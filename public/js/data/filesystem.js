/* Virtual filesystem
   Single source of truth for desktop icons, Finder, Spotlight search and window routing. */

const filesystem = {
  'work': {
    type: 'app', kind: 'finder', title: 'Work', icon: 'folder',
  },
  'about': {
    type: 'app', kind: 'about', title: 'About Me', icon: 'doc',
  },
  'resume': {
    type: 'file', kind: 'pdf', title: 'Resume.pdf', icon: 'doc',
  },
  'notes': {
    type: 'app', kind: 'notes', title: 'Notes', icon: 'notes',
  },
  'mail': {
    type: 'app', kind: 'mail', title: 'Mail', icon: 'mail',
  },
  'maps': {
    type: 'app', kind: 'maps', title: 'Maps', icon: 'maps',
  },
  'social': {
    type: 'app', kind: 'social', title: 'Social', icon: 'social',
  },
  'photos': {
    type: 'app', kind: 'finder-photos', title: 'Photos', icon: 'folder',
  },
  'photo-01': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 1', parent: 'photos',
    data: { src: '/assets/images/photos/photo-01.jpg', alt: 'Iconic Pic 1' },
  },
  'photo-03': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 2', parent: 'photos',
    data: { src: '/assets/images/photos/photo-03.jpg', alt: 'Iconic Pic 2' },
  },
  'photo-04': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 3', parent: 'photos',
    data: { src: '/assets/images/photos/photo-04.jpg', alt: 'Iconic Pic 3' },
  },
  'photo-05': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 4', parent: 'photos',
    data: { src: '/assets/images/photos/photo-05.jpg', alt: 'Iconic Pic 4' },
  },
  'photo-06': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 5', parent: 'photos',
    data: { src: '/assets/images/photos/photo-06.jpg', alt: 'Iconic Pic 5' },
  },
  'photo-07': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 6', parent: 'photos',
    data: { src: '/assets/images/photos/photo-07.jpg', alt: 'Iconic Pic 6' },
  },
  'photo-08': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 7', parent: 'photos',
    data: { src: '/assets/images/photos/photo-08.jpg', alt: 'Iconic Pic 7' },
  },
  'photo-09': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 8', parent: 'photos',
    data: { src: '/assets/images/photos/photo-09.jpg', alt: 'Iconic Pic 8' },
  },
  'photo-10': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 9', parent: 'photos',
    data: { src: '/assets/images/photos/photo-10.jpg', alt: 'Iconic Pic 9' },
  },
  'photo-11': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 10', parent: 'photos',
    data: { src: '/assets/images/photos/photo-11.jpg', alt: 'Iconic Pic 10' },
  },
  'photo-12': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 11', parent: 'photos',
    data: { src: '/assets/images/photos/photo-12.jpg', alt: 'Iconic Pic 11' },
  },
  'photo-13': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 12', parent: 'photos',
    data: { src: '/assets/images/photos/photo-13.jpg', alt: 'Iconic Pic 12' },
  },
  'photo-14': {
    type: 'file', kind: 'photo', title: 'Iconic Pic 13', parent: 'photos',
    data: { src: '/assets/images/photos/photo-14.jpg', alt: 'Iconic Pic 13' },
  },
  'mediassive': {
    type: 'folder', kind: 'folder', title: 'Mediassive', parent: 'work',
  },
  'ruvaty': {
    type: 'file', kind: 'case-study', title: 'Ruvaty.case', parent: 'work',
    data: {
      title: 'Ruvaty',
      tag: 'Web Platform · In Development, 2026',
      summary: 'A social media management platform that brings scheduling, analytics, mentions, ads, and AI assistance into one calm workspace for agencies, freelancers, and creators. The coming-soon site and waitlist are live while the app is being built.',
      cover: '/assets/images/projects/ruvaty-cover.jpg',
      body: [
        'Ruvaty is built for people who run social media for a living. Instead of juggling tabs, spreadsheets, and screenshots, agencies, freelance social media managers, and creators will plan, approve, and report on every channel from one workspace. I am designing the experience from scratch, starting from the promise behind the product: converge chaos into calm with unified social command.',
        'The product is still in development, so the first thing we shipped is the coming-soon website. It explains the product and its principles, and lets people join the early access waitlist today, so we can start building an audience and learning from real sign-ups before the app is ready.',
        'Alongside the site we published the Privacy Policy and Terms of Service. Platforms like Meta require them before granting API access, so they are what lets Ruvaty become a trusted platform that can connect to people\u2019s accounts. Because of that, the site spends a whole section on trust: how data is encrypted, that access is user-authorised and can be revoked, and that nothing is sold.',
        'The app itself is being designed around the way these teams actually work: a command center for engagement, pending approvals, and campaign status; a visual content calendar with bulk scheduling; a unified stream for comments and mentions; cross-platform analytics; ad management; and an AI assistant that suggests but never posts without approval. Each client lives in its own space, with a clean light canvas, soft purple accents, and playful hand-drawn annotations.',
      ],
      role: 'UX/UI Design, End to End',
      context: 'In Development, Coming-Soon Site Live, 2026',
      scope: 'Product Design & Coming-Soon Site',
      ux: {
        "keywords": [
          "Persona-driven design",
          "Multi-client workflows",
          "Approval flows",
          "Dashboard design",
          "Waitlist conversion",
          "Trust & data transparency",
          "Platform compliance (Meta API)",
          "Progressive disclosure"
        ],
        "rows": [
          [
            "The problem",
            "Social media managers juggle many clients and platforms, and lose hours to tabs, spreadsheets, screenshots, and chasing approvals. On the product side, platforms will only open their APIs to services they can trust."
          ],
          [
            "The goal",
            "Two goals in sequence: launch a coming-soon page that explains the product and collects early-access sign-ups, and earn platform approval by publishing clear privacy and terms pages. In parallel, design a calm single workspace for planning, approval, and reporting."
          ],
          [
            "How people will use it",
            "A visitor reads what Ruvaty will do, checks how their data is handled, and joins the waitlist. Once the app launches, a manager will open the command center, see which clients are waiting on approval, schedule posts, answer comments from one stream, and share reports."
          ],
          [
            "How I iterate",
            "I designed around three personas (agencies, freelancers, creators) and shipped the smallest useful version first, the coming-soon site, to learn from real sign-ups and platform requirements. I keep refining the app flows with the team as feedback arrives."
          ]
        ]
      },
      links: {
        live: 'https://ruvaty.com/',
      },
    },
  },
  'roux': {
    type: 'file', kind: 'case-study', title: 'Roux.case', parent: 'work',
    data: {
      title: 'ROUX',
      tag: 'Brand & Web Design · Photography Studio, 2026',
      summary: 'A visual identity and website for ROUX, a fashion, editorial, and portrait photography studio, built around the idea of concrete, light, and shadow.',
      cover: '/assets/images/projects/roux-cover.jpg',
      body: [
        'ROUX is a photography studio focused on fashion, editorials, portraits, and campaigns, built for people, brands, and stories that deserve to be seen. I developed the digital presentation under a \\u2018Concrete Light Shadow\\u2019 direction, raw texture and hard contrast carried through the typography and layout so the site feels as considered as the photography itself.',
        'Rather than organising the site around service categories, I structured it around the people actually browsing it: clients who need to discover the work quickly, understand the studio\\u2019s visual style, and decide whether ROUX is the right creative partner. A persona-driven flow, anchored around a fictional client profile, guided how the imagery and pacing were sequenced across the page.',
        'Large, confident type carries attitude without competing with the photography, while smaller supporting details give each story its context, letting the imagery stay the hero throughout the fashion, editorial, portrait, and campaign sections.',
        'Worked on this collaboratively with my friend Kari.',
      ],
      role: 'Brand & Web Design (with Kari)',
      context: 'Collaborative Project, 2026',
      scope: 'Visual Identity & Responsive Web',
      ux: {
        "keywords": [
          "Persona-driven flow",
          "Visual hierarchy",
          "Content strategy",
          "Pacing & rhythm",
          "Responsive design",
          "Collaboration"
        ],
        "rows": [
          [
            "The problem",
            "Photography sites are often organised by service, while visitors simply want to judge the style quickly and decide whether the studio fits them."
          ],
          [
            "The goal",
            "Let a client discover the work fast, understand the visual style, and feel confident enough to get in touch."
          ],
          [
            "How people use it",
            "A visitor scans the fashion, editorial, portrait, and campaign sections, led by the imagery, and reaches out once the style feels right."
          ],
          [
            "How I iterated",
            "I anchored the flow on a fictional client persona, then refined the pacing and layout in rounds with my collaborator Kari and feedback from other designers."
          ]
        ]
      },
      links: {
        behance: 'https://www.behance.net/gallery/256328111/ROUX-A-Visual-World-Built-Around-Photography',
      },
    },
  },
  'sura': {
    type: 'file', kind: 'case-study', title: 'Sura.case', parent: 'work',
    data: {
      title: 'Sura',
      tag: 'Landing Page · Personal Project, 2026',
      summary: 'A high-performance landing page for a fictional digital growth agency, designed to command trust through precision rather than decoration.',
      cover: '/assets/images/projects/sura-cover.jpg',
      body: [
        'Most agencies talk about marketing, but Sura needed to feel like infrastructure. I approached the interface as a high-performance machine, pairing an obsidian-tech aesthetic with data-driven layouts so the design earns trust through clarity and precision rather than asking for it.',
        'Every engine starts with one idea. Before opening any software, I sketched and analysed Sura\u2019s core goals on paper, then moved from rough sketch to a high-fidelity mockup, making sure the final design was a fully engineered solution rather than just visual polish.',
        'Growth doesn\u2019t stay behind a desk, so I carried the same visual authority and high-speed feel from desktop through to mobile, keeping the experience responsive, fast, and consistent everywhere.',
      ],
      role: 'Personal / Concept Project',
      context: 'Self-Directed',
      scope: 'Responsive Web, Desktop & Mobile',
      ux: {
        "keywords": [
          "Trust-building UX",
          "Goal setting",
          "Sketch to high-fidelity",
          "Data-driven layout",
          "Responsive design",
          "Performance"
        ],
        "rows": [
          [
            "The problem",
            "Most agencies talk about marketing, but visitors can’t tell whether they can be trusted with real results."
          ],
          [
            "The goal",
            "Make trust feel earned through clarity and proof, so a visitor understands the offer quickly and knows what to do next."
          ],
          [
            "How people use it",
            "A visitor scans the data-driven sections on desktop or mobile, checks the proof, and takes the next step."
          ],
          [
            "How I iterated",
            "I started on paper, sketching and analysing the core goals, then moved from rough sketch to high-fidelity, adjusting after feedback on clarity and speed."
          ]
        ]
      },
      links: {
        behance: 'https://www.behance.net/gallery/250656571/SURA-Digital-Growth-Agency-Landing-Page',
      },
    },
  },
  'finderrlink': {
    type: 'file', kind: 'case-study', title: 'FinderrLink.case', parent: 'mediassive',
    data: {
      title: 'FinderrLink',
      tag: 'SaaS Platform · Mediassive, 2026',
      summary: 'An intelligent SaaS platform connecting freelancers, enterprises, and agencies for hiring, collaboration, and mission matching, built around a native AI assistant.',
      cover: '/assets/images/projects/finderrlink-cover.jpg',
      body: [
        'Designed the complete platform end to end across three user roles (freelancer, enterprise, agency), including the freelancer dashboard, mission board, hiring and company cards, KPI widgets, and profile pages.',
        'Built a floating AI assistant into the experience that helps freelancers surface matching missions and helps enterprises write and publish missions in seconds, cutting mission creation down to under 30 seconds.',
        'Adapted the full interface for mobile, keeping visual and functional consistency across devices, shipping production-ready screens ready for real use.',
        'My performance during the internship led directly to a full-time offer. Since joining Mediassive as their sole in-house designer in August 2026, I\u2019ve continued leading the iterative UX/UI design of FinderrLink, working closely with the engineering team to bring changes into production, alongside building out the complete FinderrLink brand guidelines and visual identity.',
      ],
      role: 'UX/UI Design Intern, now UX/UI, Graphic & Brand Designer',
      context: 'Mediassive, Intern March 2026, Full-Time Since August 2026',
      scope: '3 Roles, Web & Mobile',
      ux: {
        "keywords": [
          "Multi-role UX",
          "User research",
          "Journey mapping",
          "User flows",
          "Information architecture",
          "Usability testing",
          "Google Analytics",
          "Bounce-rate analysis",
          "Conversion optimisation",
          "Iterative design"
        ],
        "rows": [
          [
            "The problem",
            "Hiring and finding missions across three very different roles was slow and unclear: too many steps to publish a mission, and no quick way to see which missions actually matched a freelancer."
          ],
          [
            "The goal",
            "Let every role reach its main outcome in as few steps as possible: a freelancer finds a matching mission, an enterprise publishes one, and an agency manages hiring and collaboration."
          ],
          [
            "How people use it",
            "A freelancer lands on a dashboard with KPIs and a mission board, then asks the AI assistant for matches. An enterprise describes a need in plain words and the assistant turns it into a published mission in under 30 seconds. An agency runs hiring and collaboration from the same system."
          ],
          [
            "How I iterated",
            "I designed each role’s flow separately, reviewed it with the developers for feasibility, then kept refining screens from real user feedback after release, shipping the changes to production with the engineering team."
          ],
          [
            "What the data told us",
            "With the dev team I set up Google Analytics to see who visits (the types of users), where they come from, and where they leave. We used it to find the points where visitors dropped off, reduce the bounce rate, and improve the path that leads to conversion."
          ]
        ]
      },
      links: {
        live: 'https://finderrlink.com/',
        instagram: 'https://www.instagram.com/finderrlink/',
      },
    },
  },
  'finderrlink-brand': {
    type: 'file', kind: 'case-study', title: 'Brand', parent: 'mediassive',
    data: {
      title: 'FinderrLink Brand Guidelines',
      tag: 'Brand Identity · Mediassive, 2026',
      summary: 'The complete brand identity system for FinderrLink, from purpose and personality through to logo construction, color, typography, and real-world mockups.',
      cover: '/assets/images/projects/finderrlink-brand-cover.jpg',
      body: [
        'Built the FinderrLink brand from its foundations up: mission, vision, and purpose, four brand values (Trust, Simplicity, Innovation, Professionalism, Growth), and a defined personality (confident, approachable, minimalist) that\u2019s calm under pressure but always moving fast.',
        'Defined a precise tone of voice and messaging pillars, including a preferred and avoided vocabulary, so every touchpoint from product copy to social captions sounds like the same brand.',
        'Engineered the logo on a mathematical grid: a 1.68 ratio system governs icon size, spacing, and clear space at every scale, from a 16px favicon to large-format signage, with full color, reversed, and monochrome variants.',
        'Built out the Coral and Charcoal color system with a secondary palette and signature gradient, paired Source Sans 3 across four weights, and defined photography direction, pattern language, and real-world mockups spanning UI, print, business cards, signage, and branded merchandise.',
      ],
      role: 'Brand Designer',
      context: 'Mediassive, 2026',
      scope: 'Brand Identity, V1.0',
      ux: {
        "keywords": [
          "Brand strategy",
          "Brand values & personality",
          "Tone of voice",
          "Design system foundations",
          "Consistency",
          "Scalability"
        ],
        "rows": [
          [
            "The problem",
            "A new product needed to look and sound like one brand everywhere (product, social media, print) without a shared reference to design from."
          ],
          [
            "The goal",
            "Give the whole team one source of truth, so anyone can make an on-brand decision quickly without waiting for the designer."
          ],
          [
            "How people use it",
            "Designers, developers, and content creators open the guidelines to pick the right logo variant, colour, typeface, or wording, from product copy to social captions."
          ],
          [
            "How I iterated",
            "I checked the logo and colour at every size, from a 16px favicon to large-format signage, and refined the system after reviewing real mockups with the team."
          ]
        ]
      },
      links: {},
    },
  },
  'collatera': {
    type: 'file', kind: 'case-study', title: 'Collatera.case', parent: 'mediassive',
    data: {
      title: 'Collatera',
      tag: 'Brand Identity & Web Design · Mediassive, 2026',
      summary: 'The brand identity and website for Collatera, an independent SAP compliance consultancy that engineers e-invoicing and statutory reporting for global enterprises.',
      cover: '/assets/images/projects/collatera-cover.jpg',
      body: [
        'Collatera is a specialist consultancy for SAP Document and Reporting Compliance (DRC), e-invoicing, and e-reporting, helping large enterprises meet tax mandates that change from one country to the next. We launched it together with Mediassive, and I was the only designer on the team, working alongside the developers and engineers who built it.',
        'I created the brand identity from scratch and designed the full website experience. The challenge was making a dense, regulation-heavy subject feel clear and trustworthy for finance, tax, and IT teams at once, so the identity stays precise and calm, with a crisp blue accent on a clean light canvas.',
        'The site is structured around the way these teams make decisions: choosing a compliance path, exploring the expertise modules, understanding the SAP DRC architecture, and seeing how an engagement runs from readiness audit to go-live and global operations.',
        'The centrepiece is the Mandates by Country live tracker, a dotted world map with country markers that turns e-invoicing timelines, regulatory models, and SAP DRC readiness across jurisdictions into something you can scan in seconds.',
      ],
      role: 'Brand Identity & UX/UI Designer (sole designer)',
      context: 'Mediassive, 2026',
      scope: 'Brand Identity & Responsive Web',
      ux: {
        "keywords": [
          "Stakeholder alignment",
          "Audience analysis",
          "Information architecture",
          "Content hierarchy",
          "Data visualisation",
          "Trust & credibility",
          "Responsive design",
          "Developer handoff"
        ],
        "rows": [
          [
            "The problem",
            "Compliance mandates differ by country and keep changing, and the people deciding (finance, tax, and IT) each look for something different in a dense, intimidating subject."
          ],
          [
            "The goal",
            "Help a visitor understand within seconds what Collatera does, which mandates affect them, and how to start a conversation, building trust from the very first screen."
          ],
          [
            "How people use it",
            "A visitor chooses their compliance path, checks the Mandates by Country tracker for their jurisdiction, reads how an engagement runs, then books a short readiness assessment."
          ],
          [
            "How I iterated",
            "As the only designer, I reviewed each version with the client and the developers, simplified the content hierarchy after every round of feedback, and kept the design aligned with what could be built and run."
          ]
        ]
      },
      links: {
        live: 'https://collatera.co/',
      },
    },
  },
  'entclinic': {
    type: 'file', kind: 'case-study', title: 'CentreORLTanger.case', parent: 'work',
    data: {
      title: 'Centre ORL Tanger',
      tag: 'Web Platform · Freelance, 2026',
      summary: 'A booking and consultation site for a specialist ENT (ear, nose, and throat) clinic in Tangier, built bilingual (French/Arabic) for a local patient base.',
      cover: '/assets/images/projects/entclinic-cover.jpg',
      body: [
        'Designed a warm, trust-building homepage for Dr. Bezzari Malhi Alae\u2019s ENT practice, leading with his credentials (15+ years of experience, CNSS/AMO coverage) and a direct consultation booking form above the fold.',
        'Structured the site around real patient concerns, laid out as clear service categories such as hearing and balance, snoring and sleep apnea, pediatric ENT, and thyroid, each with matching Arabic labels for bilingual accessibility.',
        'Built out supporting pages for the doctor\u2019s profile, the clinic itself, and contact, plus a Google-reviews section and WhatsApp/phone quick-contact, keeping the patient journey to booking as short as possible.',
      ],
      role: 'Freelance UX/UI Designer',
      context: 'Client Project, 2026',
      scope: 'Bilingual Web Platform, Booking Flow',
      ux: {
        "keywords": [
          "Patient-centred design",
          "Bilingual UX (FR/AR)",
          "Booking flow",
          "Trust signals",
          "Mobile-first",
          "Atomic design system"
        ],
        "rows": [
          [
            "The problem",
            "Patients looking for ENT care in Tangier need reassurance and a fast way to book, in French or Arabic, often from their phone."
          ],
          [
            "The goal",
            "Make the path from a health worry to a booked consultation as short as possible, while building trust in the doctor."
          ],
          [
            "How people use it",
            "A patient finds their concern in the service list, checks the doctor’s credentials and Google reviews, then books through the form, WhatsApp, or a phone call."
          ],
          [
            "How I iterated",
            "I refined the booking flow with the client until it stayed visible and short on every screen, and kept the Arabic and French labels aligned across all 7 responsive screens."
          ]
        ]
      },
      links: {
        live: 'https://centreorltanger.ma/',
      },
    },
  },
  'luma': {
    type: 'file', kind: 'case-study', title: 'Luma.case', parent: 'work',
    data: {
      title: 'LUMA',
      tag: 'Landing Page · Personal Project, 2026',
      summary: 'A digital flagship store for LUMA, a fictional AR-eyewear brand, designed to carry the user from an emotional "wow" hero moment down to hard technical proof.',
      cover: '/assets/images/projects/luma-cover.jpg',
      body: [
        'Framed the landing page as a digital flagship store rather than a simple product page, opening with an immersive hero built around the wearer and backed by real-feeling stats (market growth, unit shipments, field of view, peak brightness) to establish credibility instantly.',
        'Grounded the visual direction in human-centred research, defining the target audience and identifying the value propositions that needed to lead the story: speed, comfort, and cutting-edge technology, expressed through a dark, cinematic AR-innovation showcase and a Poppins-led type system.',
        'Carried the narrative through feature breakdowns, a "Redefine Your Reality" technical section, and customer voices, then adapted the full flow for mobile so the same wow-to-proof journey holds up on a smaller screen.',
      ],
      role: 'Personal / Concept Project',
      context: 'Self-Directed',
      scope: 'Landing Page, Desktop & Mobile',
      ux: {
        "keywords": [
          "Human-centred research",
          "Value proposition",
          "Storytelling flow",
          "Persona",
          "Credibility & proof",
          "Responsive design"
        ],
        "rows": [
          [
            "The problem",
            "AR eyewear is new to most people, so visitors need both emotion and hard proof before they trust it."
          ],
          [
            "The goal",
            "Carry the visitor from an emotional “wow” moment to technical evidence, without losing them on the way."
          ],
          [
            "How people use it",
            "A visitor lands on the hero, scrolls through features and the technical section, and reads customer voices before deciding."
          ],
          [
            "How I iterated",
            "I defined the audience and value propositions from research, then reordered sections after feedback so proof arrives right when doubt appears."
          ]
        ]
      },
      links: {
        behance: 'https://www.behance.net/gallery/241679579/LUMA-AR-2026-UIUX-Case-Study',
      },
    },
  },
  'styla': {
    type: 'file', kind: 'case-study', title: 'Styla.case', parent: 'work',
    data: {
      title: 'Styla',
      tag: 'Mobile App · Personal Project, 2026',
      summary: 'A UX/UI concept for a modern fashion shopping app, designed to fix the clutter and difficulty of finding products that plague most e-commerce apps.',
      cover: '/assets/images/projects/styla-cover.jpg',
      body: [
        'Started from a clear problem statement: online fashion shoppers struggle with cluttered browsing, hard-to-find products, and outdated interfaces. I set out to design a seamless, visually engaging shopping experience built around easy navigation, visual product discovery, and personalized recommendations.',
        'Followed a full user-centered process, moving through discovery and research, persona-building (goals, frustrations, tech habits), design and prototyping, then testing and iteration, so every screen was grounded in an actual user need rather than just aesthetics.',
        'Brought the interface to life with a clean, image-forward home feed, category shortcuts, and product cards, tied together with a Poppins type system and a considered colour palette to give Styla its own distinct, modern brand identity.',
      ],
      role: 'Personal / Concept Project',
      context: 'Self-Directed',
      scope: 'Mobile App, UX Research & UI Design',
      ux: {
        "keywords": [
          "User research",
          "Problem statement",
          "Personas",
          "Visual product discovery",
          "Prototyping",
          "Usability testing",
          "Iteration"
        ],
        "rows": [
          [
            "The problem",
            "Online fashion shoppers struggle with cluttered browsing, hard-to-find products, and outdated interfaces."
          ],
          [
            "The goal",
            "A seamless shopping experience built around easy navigation, visual product discovery, and personalised recommendations."
          ],
          [
            "How people use it",
            "A shopper opens an image-led home feed, jumps in through category shortcuts, and finds products on clear, scannable cards."
          ],
          [
            "How I iterated",
            "I followed discovery, personas (goals, frustrations, tech habits), prototyping, then testing and iteration, so each screen answered a real user need."
          ]
        ]
      },
      links: {
        behance: 'https://www.behance.net/gallery/241378235/Styla-Fashion-App-Streamlined-Shopping-Experience',
      },
    },
  },
  'aureum': {
    type: 'file', kind: 'case-study', title: 'Aureum.case', parent: 'work',
    data: {
      title: 'Aureum',
      tag: 'Web Platform · Personal Project, 2026',
      summary: 'A high-end jewelry house concept built around restraint and material presence, letting diamonds, gold, and negative space carry the luxury rather than heavy branding.',
      cover: '/assets/images/projects/aureum-cover.jpg',
      body: [
        'Designed Aureum as a digital jewelry house, opening with a cinematic "Exceptional Brilliance Awaits" hero and letting full-bleed product photography (diamond necklaces, statement earrings) do the selling instead of promotional copy.',
        'Paired an elegant serif display face with Inter for body text, and built a quiet, near-monochrome dark palette so the jewelry itself, not the interface, stayed the visual focus throughout Signature Collections and Curated Masterpieces.',
        'Extended the same restrained, gallery-like language into a private viewing selection and service pages, then adapted the full experience for mobile so the brand feel held up across devices.',
      ],
      role: 'Personal / Concept Project',
      context: 'Self-Directed',
      scope: 'Web Platform, Desktop & Mobile',
      ux: {
        "keywords": [
          "Restraint & hierarchy",
          "Luxury UX",
          "Service journey",
          "Content-first design",
          "Responsive design"
        ],
        "rows": [
          [
            "The problem",
            "Luxury buyers distrust noisy interfaces: heavy branding and promotion get in the way of the product itself."
          ],
          [
            "The goal",
            "Let the jewellery lead, and keep the interface quiet enough that the product carries the luxury."
          ],
          [
            "How people use it",
            "A visitor browses the Signature Collections and Curated Masterpieces, then requests a private viewing through a simple service flow."
          ],
          [
            "How I iterated",
            "I kept removing elements until only what a buyer needs remained, then checked the hierarchy again on mobile and refined it from feedback."
          ]
        ]
      },
      links: {
        behance: 'https://www.behance.net/gallery/245854745/AUREUM-High-End-Jewelry-House-UIUX-Case-Study',
      },
    },
  },
  'aetherix': {
    type: 'file', kind: 'case-study', title: 'Aetherix.case', parent: 'work',
    data: {
      title: 'Aetherix',
      tag: 'Landing Page · Personal Project, 2026',
      summary: 'A high-impact landing page for a premium drone brand, designed to balance aspirational, cinematic imagery with the hard technical specs serious buyers need.',
      cover: '/assets/images/projects/aetherix-cover.jpg',
      body: [
        'The high-end drone market tends to either drown users in technical data or oversell on lifestyle imagery. I designed Aetherix around Progressive Disclosure: an emotional, high-impact hero draws the user in first, then the page gradually introduces performance data and social proof as they scroll.',
        'Structured the flow through a simplified product architecture and a value-first "Perspectives Unlocked" gallery, letting real-world use cases (filmmaking, adventure photography, exploration) build desire before any spec sheet appears.',
        'Backed the direction with a defined user persona and a bold Clash Display type system, then carried the same guided, cinematic pacing through to the mobile layout so the experience held together at every size.',
      ],
      role: 'Personal / Concept Project',
      context: 'Self-Directed',
      scope: 'Landing Page, Desktop & Mobile',
      ux: {
        "keywords": [
          "Progressive disclosure",
          "Persona",
          "Information architecture",
          "Value-first storytelling",
          "Responsive design"
        ],
        "rows": [
          [
            "The problem",
            "Premium drone pages either drown people in technical data or oversell with lifestyle imagery."
          ],
          [
            "The goal",
            "Draw the user in emotionally first, then deliver the specs and social proof serious buyers need, in the right order."
          ],
          [
            "How people use it",
            "A visitor is pulled in by the hero, explores real-world use cases in the gallery, and only then meets performance data and proof as they scroll."
          ],
          [
            "How I iterated",
            "I designed around a defined persona and tested the order of the story, moving content until the emotional and technical parts supported each other, on desktop and mobile."
          ]
        ]
      },
      links: {
        behance: 'https://www.behance.net/gallery/241963467/Aetherix-UXUI-Case-Study-2026',
      },
    },
  },
  'esivo': {
    type: 'file', kind: 'case-study', title: 'Esivo.case', parent: 'work',
    data: {
      title: 'ESIVO',
      tag: 'Web Platform · Collaborative Project, 2026',
      summary: 'A brand and product site for a next-generation GPU architecture company, designed to make deeply technical hardware feel as credible and precise as the engineering behind it.',
      cover: '/assets/images/projects/esivo-cover.jpg',
      body: [
        'Designed the ESIVO site around the idea that every component in the ESIVO-1 was a research paper before it was a product, translating that rigor into a confident, high-contrast red, black, and white system built for a technical, engineering-literate audience.',
        'Structured the story around ESIVO\u2019s six independent engineering systems (thermal, cooling, signal, power, compute, memory), optimized in isolation then calibrated together, and let hard performance numbers (128 TFLOPS, 2.4TB/s, 1.6TB/s optical bandwidth) carry as much visual weight as the product photography.',
        'Backed the product narrative with company credibility: team, funding, and founding story, then carried the same dense, engineered feel through to mobile.',
        'Worked on this collaboratively with Karina Kudina, a UX/UI designer from Ukraine.',
      ],
      role: 'Collaborative Project (with Karina Kudina)',
      context: 'Collaborative Project, 2026',
      scope: 'Web Platform, Desktop & Mobile',
      ux: {
        "keywords": [
          "Technical audience research",
          "Information hierarchy",
          "Data-led storytelling",
          "Credibility design",
          "Collaboration",
          "Responsive design"
        ],
        "rows": [
          [
            "The problem",
            "Deeply technical hardware has to feel credible to an engineering-literate audience without overwhelming everyone else."
          ],
          [
            "The goal",
            "Let the numbers and the six engineering systems prove the product, with the company story to back them up."
          ],
          [
            "How people use it",
            "A visitor reads the six systems, compares the headline performance numbers, then checks the team, funding, and founding story."
          ],
          [
            "How I iterated",
            "I co-designed with Karina Kudina, reviewing each other’s work in rounds and refining the hierarchy of specs versus story until it read clearly on desktop and mobile."
          ]
        ]
      },
      links: {
        behance: 'https://www.behance.net/gallery/252029567/ESIVO-Next-Gen-GPU-Architecture-UXUI-Design',
      },
    },
  },
};

const desktopIconOrder = ['work', 'about', 'photos', 'maps', 'resume', 'notes', 'mail', 'social'];
const dockOrder = ['work', 'about', 'photos', 'maps', 'notes', 'mail', 'social', 'resume'];
const photoFiles = Object.keys(filesystem).filter((k) => filesystem[k].parent === 'photos');
