const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  theme: { type: String, default: 'dark' },
  
  // TAMBAHAN BARU: Ruang untuk kustomisasi karir
  customization: {
    jobTitle: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    headline: { type: String, default: '' },
    accentColor: { type: String, default: '#38bdf8' },
    visualTheme: { type: String, default: 'glassmorphism' },
    customDomain: { type: String, default: '' },
    experiences: [{
      role: { type: String, default: '' },
      company: { type: String, default: '' },
      period: { type: String, default: '' },
      summary: { type: String, default: '' }
    }],
    educations: [{
      school: { type: String, default: '' },
      degree: { type: String, default: '' },
      period: { type: String, default: '' },
      summary: { type: String, default: '' }
    }],
    certifications: [{
      title: { type: String, default: '' },
      issuer: { type: String, default: '' },
      year: { type: String, default: '' },
      credentialUrl: { type: String, default: '' }
    }]
  },
  
  profile: {
    name: String,
    avatar_url: String,
    bio: String,
    location: String
  },
  repositories: [{
    id: Number,
    name: String,
    description: String,
    html_url: String,
    language: String,
    stargazers_count: Number,
    forks_count: Number,
    homepage: String,
    updated_at: String,
    topics: [String],
    readme_summary: String,
    contribution_highlights: [String]
  }],
  analytics: {
    views: { type: Number, default: 0 },
    projectClicks: [{
      repoId: Number,
      repoName: String,
      count: { type: Number, default: 0 },
      lastClickedAt: Date
    }],
    modalEvents: [{
      repoId: Number,
      repoName: String,
      action: { type: String, enum: ['open', 'close'], default: 'open' },
      count: { type: Number, default: 0 },
      lastEventAt: Date
    }]
  },
  draft: {
    selectedRepoIds: [{ type: Number }],
    customization: {
      jobTitle: { type: String, default: '' },
      linkedinUrl: { type: String, default: '' },
      headline: { type: String, default: '' },
      accentColor: { type: String, default: '#38bdf8' },
      visualTheme: { type: String, default: 'glassmorphism' },
      customDomain: { type: String, default: '' },
      experiences: [{
        role: { type: String, default: '' },
        company: { type: String, default: '' },
        period: { type: String, default: '' },
        summary: { type: String, default: '' }
      }],
      educations: [{
        school: { type: String, default: '' },
        degree: { type: String, default: '' },
        period: { type: String, default: '' },
        summary: { type: String, default: '' }
      }],
      certifications: [{
        title: { type: String, default: '' },
        issuer: { type: String, default: '' },
        year: { type: String, default: '' },
        credentialUrl: { type: String, default: '' }
      }]
    },
    updatedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);