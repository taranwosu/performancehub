// src/pages/employee-profile/components/DevelopmentTab.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DevelopmentTab = ({ employee, currentUser }) => {
  const [activeSection, setActiveSection] = useState('skills'); // skills, training, career

  // Mock skill assessments data
  const skillAssessments = [
    {
      category: 'Technical Skills',
      skills: [
        { name: 'React/JavaScript', level: 4.5, target: 5.0, lastAssessed: '2024-01-15' },
        { name: 'Node.js', level: 4.2, target: 4.5, lastAssessed: '2024-01-15' },
        { name: 'AWS', level: 3.8, target: 4.5, lastAssessed: '2023-12-20' },
        { name: 'Database Design', level: 4.0, target: 4.2, lastAssessed: '2023-11-30' },
        { name: 'System Architecture', level: 3.5, target: 4.0, lastAssessed: '2024-01-10' }
      ]
    },
    {
      category: 'Soft Skills',
      skills: [
        { name: 'Leadership', level: 4.0, target: 4.5, lastAssessed: '2024-01-15' },
        { name: 'Communication', level: 3.8, target: 4.2, lastAssessed: '2024-01-15' },
        { name: 'Project Management', level: 3.5, target: 4.0, lastAssessed: '2023-12-01' },
        { name: 'Mentoring', level: 4.3, target: 4.5, lastAssessed: '2024-01-10' },
        { name: 'Problem Solving', level: 4.6, target: 4.8, lastAssessed: '2024-01-15' }
      ]
    }
  ];

  // Mock training data
  const trainingData = {
    completed: [
      {
        id: 1,
        title: 'Advanced React Patterns',
        provider: 'Tech Academy',
        completedDate: '2023-12-15',
        duration: '40 hours',
        certificate: true,
        score: 92,
        skills: ['React', 'JavaScript', 'Component Design']
      },
      {
        id: 2,
        title: 'AWS Solutions Architect Associate',
        provider: 'AWS Training',
        completedDate: '2023-10-20',
        duration: '60 hours',
        certificate: true,
        score: 87,
        skills: ['AWS', 'Cloud Architecture', 'System Design']
      },
      {
        id: 3,
        title: 'Leadership Fundamentals',
        provider: 'Corporate University',
        completedDate: '2023-09-30',
        duration: '20 hours',
        certificate: true,
        score: 95,
        skills: ['Leadership', 'Team Management', 'Communication']
      }
    ],
    inProgress: [
      {
        id: 4,
        title: 'Microservices Architecture',
        provider: 'Cloud Institute',
        startDate: '2024-01-01',
        estimatedCompletion: '2024-02-28',
        progress: 65,
        duration: '50 hours',
        skills: ['Microservices', 'Docker', 'Kubernetes']
      },
      {
        id: 5,
        title: 'Advanced Communication Skills',
        provider: 'Professional Development',
        startDate: '2023-12-01',
        estimatedCompletion: '2024-01-31',
        progress: 80,
        duration: '25 hours',
        skills: ['Communication', 'Presentation', 'Stakeholder Management']
      }
    ],
    recommended: [
      {
        id: 6,
        title: 'Machine Learning Fundamentals',
        provider: 'Data Science Academy',
        duration: '45 hours',
        priority: 'medium',
        skills: ['Python', 'ML Algorithms', 'Data Analysis'],
        reason: 'Aligns with team\'s AI initiative roadmap'
      },
      {
        id: 7,
        title: 'Executive Presence',
        provider: 'Leadership Institute',
        duration: '30 hours',
        priority: 'high',
        skills: ['Leadership', 'Executive Communication', 'Strategic Thinking'],
        reason: 'Supports career progression to senior leadership'
      }
    ]
  };

  // Mock career progression data
  const careerProgression = {
    currentLevel: 'Senior Software Engineer',
    nextLevel: 'Staff Engineer / Tech Lead',
    progressToNext: 75,
    timeline: '6-12 months',
    requirements: [
      { skill: 'Technical Leadership', current: 3.8, required: 4.2, met: false },
      { skill: 'System Design', current: 4.0, required: 4.0, met: true },
      { skill: 'Mentoring', current: 4.3, required: 4.0, met: true },
      { skill: 'Stakeholder Communication', current: 3.5, required: 4.0, met: false },
      { skill: 'Project Delivery', current: 4.5, required: 4.0, met: true }
    ],
    milestones: [
      { title: 'Lead major technical initiative', completed: true, date: '2023-12-01' },
      { title: 'Mentor 2+ junior developers', completed: true, date: '2023-11-15' },
      { title: 'Complete leadership training', completed: false, target: '2024-02-28' },
      { title: 'Present to senior leadership', completed: false, target: '2024-03-15' },
      { title: 'Drive architectural decisions', completed: false, target: '2024-04-30' }
    ]
  };

  const canManageDevelopment = currentUser?.role === 'manager';

  const getSkillLevelColor = (current, target) => {
    if (current >= target) return 'text-success';
    if (current >= target * 0.8) return 'text-warning';
    return 'text-error';
  };

  const getSkillProgressColor = (current, target) => {
    if (current >= target) return 'bg-success';
    if (current >= target * 0.8) return 'bg-warning';
    return 'bg-error';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10 border-error';
      case 'medium':
        return 'text-warning bg-warning/10 border-warning';
      case 'low':
        return 'text-success bg-success/10 border-success';
      default:
        return 'text-text-secondary bg-background border-border';
    }
  };

  const renderSkillsSection = () => (
    <div className="space-y-6">
      {skillAssessments?.map((category) => (
        <div key={category.category} className="border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">{category.category}</h3>
          <div className="space-y-4">
            {category.skills?.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-text-primary">{skill.name}</span>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`font-medium ${getSkillLevelColor(skill.level, skill.target)}`}>
                        {skill.level}/5.0
                      </span>
                      <span className="text-text-secondary">
                        Target: {skill.target}/5.0
                      </span>
                      <span className="text-text-secondary">
                        Last assessed: {new Date(skill.lastAssessed).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {/* Current level */}
                    <div className="flex-1">
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getSkillProgressColor(skill.level, skill.target)}`}
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    {/* Target level indicator */}
                    <div className="w-2 flex items-center">
                      <div
                        className="w-1 h-4 bg-primary rounded"
                        style={{ marginTop: `-${((5 - skill.target) / 5) * 16}px` }}
                        title="Target level"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {canManageDevelopment && (
        <div className="flex justify-end">
          <button className="btn-primary text-sm">
            <Icon name="Plus" size={16} className="mr-2" />
            Add Skill Assessment
          </button>
        </div>
      )}
    </div>
  );

  const renderTrainingSection = () => (
    <div className="space-y-6">
      {/* In Progress Training */}
      {trainingData.inProgress?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="Play" size={16} className="mr-2 text-primary" />
            In Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingData.inProgress?.map((training) => (
              <div key={training.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-text-primary">{training.title}</h4>
                    <p className="text-sm text-text-secondary">{training.provider}</p>
                  </div>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                    {training.progress}%
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${training.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-xs text-text-secondary mb-3">
                  <div>Duration: {training.duration}</div>
                  <div>Est. completion: {new Date(training.estimatedCompletion).toLocaleDateString()}</div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {training.skills?.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-background text-text-secondary text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Completed Training */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Icon name="CheckCircle" size={16} className="mr-2 text-success" />
          Completed
        </h3>
        <div className="space-y-3">
          {trainingData.completed?.map((training) => (
            <div key={training.id} className="border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-text-primary">{training.title}</h4>
                  {training.certificate && (
                    <Icon name="Award" size={14} className="text-warning" title="Certificate earned" />
                  )}
                  <span className="text-sm text-success font-medium">Score: {training.score}%</span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-text-secondary mb-2">
                  <span>{training.provider}</span>
                  <span>•</span>
                  <span>{training.duration}</span>
                  <span>•</span>
                  <span>Completed: {new Date(training.completedDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {training.skills?.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-background text-text-secondary text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {training.certificate && (
                <button className="btn-secondary text-sm ml-4">
                  <Icon name="Download" size={14} className="mr-1" />
                  Certificate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Recommended Training */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Icon name="Lightbulb" size={16} className="mr-2 text-warning" />
          Recommended
        </h3>
        <div className="space-y-3">
          {trainingData.recommended?.map((training) => (
            <div key={training.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-text-primary">{training.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(training.priority)}`}>
                      {training.priority} priority
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-text-secondary mb-2">
                    <span>{training.provider}</span>
                    <span>•</span>
                    <span>{training.duration}</span>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-3 italic">
                    {training.reason}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {training.skills?.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-background text-text-secondary text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button className="btn-primary text-sm ml-4">
                  Enroll
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCareerSection = () => (
    <div className="space-y-6">
      {/* Career Progression Overview */}
      <div className="border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Icon name="TrendingUp" size={16} className="mr-2" />
          Career Progression
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm text-text-secondary mb-1">Current Level</div>
            <div className="font-semibold text-text-primary">{careerProgression.currentLevel}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-text-secondary mb-1">Next Level</div>
            <div className="font-semibold text-primary">{careerProgression.nextLevel}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-text-secondary mb-1">Estimated Timeline</div>
            <div className="font-semibold text-text-primary">{careerProgression.timeline}</div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Progress to Next Level</span>
            <span className="text-sm font-medium text-text-primary">{careerProgression.progressToNext}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${careerProgression.progressToNext}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Requirements */}
      <div className="border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Icon name="CheckSquare" size={16} className="mr-2" />
          Promotion Requirements
        </h3>
        
        <div className="space-y-4">
          {careerProgression.requirements?.map((req) => (
            <div key={req.skill} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon 
                  name={req.met ? "CheckCircle" : "Circle"} 
                  size={16} 
                  className={req.met ? "text-success" : "text-text-secondary"}
                />
                <span className="font-medium text-text-primary">{req.skill}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className={req.met ? "text-success" : "text-warning"}>
                    {req.current}/5.0
                  </span>
                  <span className="text-text-secondary mx-1">/</span>
                  <span className="text-text-secondary">{req.required}/5.0</span>
                </div>
                <div className="w-24">
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        req.met ? 'bg-success' : 'bg-warning'
                      }`}
                      style={{ width: `${(req.current / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Career Milestones */}
      <div className="border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Icon name="Flag" size={16} className="mr-2" />
          Career Milestones
        </h3>
        
        <div className="space-y-4">
          {careerProgression.milestones?.map((milestone, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                milestone.completed ? 'bg-success text-white' : 'bg-background border-2 border-border'
              }`}>
                {milestone.completed ? (
                  <Icon name="Check" size={14} />
                ) : (
                  <span className="text-xs font-medium text-text-secondary">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    milestone.completed ? 'text-text-primary line-through' : 'text-text-primary'
                  }`}>
                    {milestone.title}
                  </h4>
                  <span className="text-sm text-text-secondary">
                    {milestone.completed 
                      ? `Completed: ${new Date(milestone.date).toLocaleDateString()}` 
                      : `Target: ${new Date(milestone.target).toLocaleDateString()}`
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex space-x-1 bg-background rounded-lg p-1">
        {[
          { id: 'skills', label: 'Skills Assessment', icon: 'BarChart3' },
          { id: 'training', label: 'Training & Certifications', icon: 'GraduationCap' },
          { id: 'career', label: 'Career Progression', icon: 'TrendingUp' }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
              activeSection === section.id
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name={section.icon} size={16} />
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      {/* Section Content */}
      {activeSection === 'skills' && renderSkillsSection()}
      {activeSection === 'training' && renderTrainingSection()}
      {activeSection === 'career' && renderCareerSection()}
    </div>
  );
};

export default DevelopmentTab;