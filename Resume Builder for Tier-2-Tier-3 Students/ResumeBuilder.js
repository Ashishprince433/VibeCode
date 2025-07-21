let currentStep = 1;
let selectedTemplate = 'modern';
let skills = [];
let zoomLevel = 1;
let autoSaveInterval;
let completionPercentage = 20;

// Initialize auto-save and progress tracking
document.addEventListener('DOMContentLoaded', function () {
    startAutoSave();
    updateProgressIndicators();
    updateLastUpdated();
});

// Template selection with enhanced animations
function selectTemplate(template) {
    selectedTemplate = template;
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('template-selected');
    });
    event.target.closest('.template-card').classList.add('template-selected');

    // Add selection animation
    const selectedCard = event.target.closest('.template-card');
    selectedCard.style.transform = 'scale(0.95)';
    setTimeout(() => {
        selectedCard.style.transform = '';
    }, 150);

    updatePreview();
    showNotification(`${template.charAt(0).toUpperCase() + template.slice(1)} template selected!`, 'success');
}

// Enhanced progress tracking
function updateProgressIndicators() {
    const data = collectFormData();
    let progress = 20; // Base for template selection

    // Calculate completion based on filled fields
    if (data.firstName && data.lastName && data.email) progress += 20;
    if (data.experience.some(exp => exp.jobTitle && exp.company)) progress += 20;
    if (data.education.some(edu => edu.degree && edu.institution)) progress += 15;
    if (skills.length > 0) progress += 15;
    if (data.summary) progress += 10;

    completionPercentage = Math.min(progress, 100);

    // Update all progress bars
    document.getElementById('overall-progress').style.width = completionPercentage + '%';
    document.getElementById('progress-text').textContent = completionPercentage + '%';
    document.getElementById('main-progress').style.width = completionPercentage + '%';

    // Update step-specific progress
    updateStepProgress();
}

function updateStepProgress() {
    const data = collectFormData();

    // Step 1: Template (always 100% if selected)
    document.getElementById('step-1-progress').style.width = '100%';

    // Step 2: Personal Info
    let step2Progress = 0;
    if (data.firstName) step2Progress += 25;
    if (data.lastName) step2Progress += 25;
    if (data.email) step2Progress += 25;
    if (data.title) step2Progress += 25;
    document.getElementById('step-2-progress').style.width = step2Progress + '%';

    // Step 3: Experience
    let step3Progress = data.experience.some(exp => exp.jobTitle && exp.company) ? 100 : 0;
    document.getElementById('step-3-progress').style.width = step3Progress + '%';

    // Step 4: Skills
    let step4Progress = skills.length > 0 ? 100 : 0;
    document.getElementById('step-4-progress').style.width = step4Progress + '%';

    // Step 5: Preview
    let step5Progress = completionPercentage >= 80 ? 100 : 0;
    document.getElementById('step-5-progress').style.width = step5Progress + '%';
}

// Auto-save functionality
function startAutoSave() {
    autoSaveInterval = setInterval(() => {
        saveProgress(true); // Silent save
    }, 30000); // Every 30 seconds
}

function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('last-updated').textContent = timeString;
}

// Enhanced step navigation with animations
function nextStep() {
    if (currentStep < 5) {
        // Mark current step as completed with animation
        const currentStepEl = document.getElementById(`step-${currentStep}`);
        currentStepEl.className = 'step-completed w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300';

        // Update connector
        const connector = document.getElementById(`connector-${currentStep}`);
        if (connector) {
            connector.style.width = '100%';
        }

        // Hide current section with fade
        const currentSection = document.getElementById(`section-${currentStep}`);
        currentSection.style.opacity = '0';
        currentSection.style.transform = 'translateX(-20px)';

        setTimeout(() => {
            currentSection.classList.remove('active');
            currentStep++;

            // Show next section with fade in
            const nextSection = document.getElementById(`section-${currentStep}`);
            nextSection.classList.add('active');
            nextSection.style.opacity = '0';
            nextSection.style.transform = 'translateX(20px)';

            setTimeout(() => {
                nextSection.style.opacity = '1';
                nextSection.style.transform = 'translateX(0)';
            }, 50);

            // Update step indicator with animation
            if (currentStep <= 5) {
                const nextStepEl = document.getElementById(`step-${currentStep}`);
                nextStepEl.className = 'step-active w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300';

                // Update step label colors
                document.querySelectorAll('.step-inactive, .step-active, .step-completed').forEach((step, index) => {
                    const label = step.parentElement.querySelector('span');
                    if (index + 1 === currentStep) {
                        label.className = 'mt-3 font-semibold text-white text-sm';
                    } else if (index + 1 < currentStep) {
                        label.className = 'mt-3 font-semibold text-white text-sm';
                    } else {
                        label.className = 'mt-3 font-semibold text-white/60 text-sm';
                    }
                });
            }

            updatePreview();
            updateProgressIndicators();
        }, 300);
    }
}

function prevStep() {
    if (currentStep > 1) {
        // Mark current step as inactive
        document.getElementById(`step-${currentStep}`).className = 'step-inactive w-10 h-10 rounded-full flex items-center justify-center font-semibold';

        // Hide current section
        document.getElementById(`section-${currentStep}`).classList.remove('active');

        currentStep--;

        // Show previous section
        document.getElementById(`section-${currentStep}`).classList.add('active');

        // Update step indicator
        document.getElementById(`step-${currentStep}`).className = 'step-active w-10 h-10 rounded-full flex items-center justify-center font-semibold';
    }
}

// Add dynamic sections
function addEducation() {
    const educationList = document.getElementById('education-list');
    const newEducation = document.createElement('div');
    newEducation.className = 'education-item border border-gray-200 rounded-lg p-4';
    newEducation.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-medium text-gray-800">Education Entry</h4>
                    <button onclick="removeItem(this)" class="text-red-600 hover:text-red-800">Remove</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Degree *</label>
                        <input type="text" class="degree w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Master of Science in Data Science" onchange="updatePreview()">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Institution *</label>
                        <input type="text" class="institution w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="State University" onchange="updatePreview()">
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Start Year</label>
                        <input type="number" class="start-year w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="2024" onchange="updatePreview()">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">End Year</label>
                        <input type="number" class="end-year w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="2026" onchange="updatePreview()">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">GPA (Optional)</label>
                        <input type="text" class="gpa w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="3.9/4.0" onchange="updatePreview()">
                    </div>
                </div>
            `;
    educationList.appendChild(newEducation);
}

function addExperience() {
    const experienceList = document.getElementById('experience-list');
    const newExperience = document.createElement('div');
    newExperience.className = 'experience-item border border-gray-200 rounded-lg p-4';
    newExperience.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-medium text-gray-800">Work Experience</h4>
                    <button onclick="removeItem(this)" class="text-red-600 hover:text-red-800">Remove</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                        <input type="text" class="job-title w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Full Stack Developer" onchange="updatePreview()">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input type="text" class="company w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Innovation Labs" onchange="updatePreview()">
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input type="month" class="start-date w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" onchange="updatePreview()">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input type="month" class="end-date w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" onchange="updatePreview()">
                        <label class="flex items-center mt-2">
                            <input type="checkbox" class="current-job mr-2" onchange="toggleCurrentJob(this)">
                            <span class="text-sm text-gray-600">Currently working here</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea class="description w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" placeholder="• Led development of microservices architecture&#10;• Mentored junior developers and conducted code reviews&#10;• Increased system efficiency by 40%" onchange="updatePreview()"></textarea>
                </div>
            `;
    experienceList.appendChild(newExperience);
}

function addProject() {
    const projectsList = document.getElementById('projects-list');
    const newProject = document.createElement('div');
    newProject.className = 'project-item border border-gray-200 rounded-lg p-4';
    newProject.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-medium text-gray-800">Project</h4>
                    <button onclick="removeItem(this)" class="text-red-600 hover:text-red-800">Remove</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                        <input type="text" class="project-name w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="AI Chatbot Application" onchange="updatePreview()">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
                        <input type="text" class="project-tech w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Python, TensorFlow, Flask" onchange="updatePreview()">
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Project URL (Optional)</label>
                    <input type="url" class="project-url w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://github.com/username/ai-chatbot" onchange="updatePreview()">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea class="project-description w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" placeholder="• Developed an AI-powered chatbot using natural language processing&#10;• Integrated with multiple APIs for enhanced functionality&#10;• Achieved 95% accuracy in intent recognition" onchange="updatePreview()"></textarea>
                </div>
            `;
    projectsList.appendChild(newProject);
}

function removeItem(button) {
    button.closest('.education-item, .experience-item, .project-item').remove();
    updatePreview();
}

function toggleCurrentJob(checkbox) {
    const endDateInput = checkbox.closest('.experience-item').querySelector('.end-date');
    if (checkbox.checked) {
        endDateInput.disabled = true;
        endDateInput.value = '';
    } else {
        endDateInput.disabled = false;
    }
    updatePreview();
}

// Skills management
function addSkill(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const skillInput = document.getElementById('skill-input');
        const skill = skillInput.value.trim();
        if (skill && !skills.includes(skill)) {
            skills.push(skill);
            skillInput.value = '';
            displaySkills();
            updatePreview();
        }
    }
}

function addPredefinedSkill(skill) {
    if (!skills.includes(skill)) {
        skills.push(skill);
        displaySkills();
        updatePreview();
    }
}

function removeSkill(skill) {
    skills = skills.filter(s => s !== skill);
    displaySkills();
    updatePreview();
}

function displaySkills() {
    const skillsDisplay = document.getElementById('skills-display');
    skillsDisplay.innerHTML = skills.map(skill =>
        `<span class="skill-tag">${skill} <button onclick="removeSkill('${skill}')" class="ml-2 text-red-600">×</button></span>`
    ).join('');
}

// Enhanced resume preview with loading states
function updatePreview() {
    const preview = document.getElementById('resume-preview');
    const data = collectFormData();

    // Show loading state
    preview.style.opacity = '0.7';

    setTimeout(() => {
        let resumeHTML = '';

        switch (selectedTemplate) {
            case 'modern':
                resumeHTML = generateModernTemplate(data);
                break;
            case 'classic':
                resumeHTML = generateClassicTemplate(data);
                break;
            case 'creative':
                resumeHTML = generateCreativeTemplate(data);
                break;
            case 'minimal':
                resumeHTML = generateMinimalTemplate(data);
                break;
            default:
                resumeHTML = generateModernTemplate(data);
        }

        preview.innerHTML = resumeHTML;
        preview.style.opacity = '1';
        updateLastUpdated();
        updateProgressIndicators();
    }, 200);
}

// Modern helper functions
function showQuickHelp() {
    document.getElementById('help-modal').classList.remove('hidden');
    document.getElementById('help-modal').classList.add('flex');
}

function hideQuickHelp() {
    document.getElementById('help-modal').classList.add('hidden');
    document.getElementById('help-modal').classList.remove('flex');
}

function togglePreviewMode() {
    const preview = document.querySelector('.preview-container');
    if (preview.classList.contains('fixed')) {
        // Exit fullscreen
        preview.classList.remove('fixed', 'inset-0', 'z-50', 'bg-white');
        preview.classList.add('sticky');
        document.body.style.overflow = 'auto';
    } else {
        // Enter fullscreen
        preview.classList.add('fixed', 'inset-0', 'z-50', 'bg-white');
        preview.classList.remove('sticky');
        document.body.style.overflow = 'hidden';
    }
}

// Enhanced save function
function saveProgress(silent = false) {
    const data = collectFormData();
    data.selectedTemplate = selectedTemplate;
    data.skills = skills;
    data.currentStep = currentStep;
    data.completionPercentage = completionPercentage;
    data.timestamp = new Date().toISOString();

    localStorage.setItem('resumeBuilder_progress', JSON.stringify(data));

    if (!silent) {
        showNotification('Progress saved successfully!', 'success');
    }

    updateLastUpdated();
}

function collectFormData() {
    return {
        firstName: document.getElementById('firstName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        title: document.getElementById('title')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        linkedin: document.getElementById('linkedin')?.value || '',
        portfolio: document.getElementById('portfolio')?.value || '',
        location: document.getElementById('location')?.value || '',
        summary: document.getElementById('summary')?.value || '',
        education: Array.from(document.querySelectorAll('.education-item')).map(item => ({
            degree: item.querySelector('.degree')?.value || '',
            institution: item.querySelector('.institution')?.value || '',
            startYear: item.querySelector('.start-year')?.value || '',
            endYear: item.querySelector('.end-year')?.value || '',
            gpa: item.querySelector('.gpa')?.value || ''
        })),
        experience: Array.from(document.querySelectorAll('.experience-item')).map(item => ({
            jobTitle: item.querySelector('.job-title')?.value || '',
            company: item.querySelector('.company')?.value || '',
            startDate: item.querySelector('.start-date')?.value || '',
            endDate: item.querySelector('.current-job')?.checked ? 'Present' : item.querySelector('.end-date')?.value || '',
            description: item.querySelector('.description')?.value || ''
        })),
        projects: Array.from(document.querySelectorAll('.project-item')).map(item => ({
            name: item.querySelector('.project-name')?.value || '',
            tech: item.querySelector('.project-tech')?.value || '',
            url: item.querySelector('.project-url')?.value || '',
            description: item.querySelector('.project-description')?.value || ''
        })),
        skills: skills
    };
}

function generateModernTemplate(data) {
    return `
                <div style="max-width: 8.5in; margin: 0 auto; background: white; font-family: 'Arial', sans-serif; line-height: 1.6; color: #333;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 2.5em; font-weight: bold;">${data.firstName} ${data.lastName}</h1>
                        <p style="margin: 10px 0 0 0; font-size: 1.2em; opacity: 0.9;">${data.title}</p>
                        <div style="margin-top: 20px; font-size: 0.9em;">
                            ${data.email ? `<span style="margin: 0 15px;">📧 ${data.email}</span>` : ''}
                            ${data.phone ? `<span style="margin: 0 15px;">📱 ${data.phone}</span>` : ''}
                            ${data.location ? `<span style="margin: 0 15px;">📍 ${data.location}</span>` : ''}
                        </div>
                        <div style="margin-top: 10px; font-size: 0.9em;">
                            ${data.linkedin ? `<span style="margin: 0 15px;">💼 ${data.linkedin}</span>` : ''}
                            ${data.portfolio ? `<span style="margin: 0 15px;">🌐 ${data.portfolio}</span>` : ''}
                        </div>
                    </div>
                    
                    <div style="padding: 30px;">
                        ${data.summary ? `
                            <div style="margin-bottom: 30px;">
                                <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-bottom: 15px;">Professional Summary</h2>
                                <p style="text-align: justify;">${data.summary}</p>
                            </div>
                        ` : ''}
                        
                        ${data.experience.filter(exp => exp.jobTitle || exp.company).length > 0 ? `
                            <div style="margin-bottom: 30px;">
                                <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-bottom: 15px;">Experience</h2>
                                ${data.experience.filter(exp => exp.jobTitle || exp.company).map(exp => `
                                    <div style="margin-bottom: 20px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                            <h3 style="margin: 0; color: #333; font-size: 1.1em;">${exp.jobTitle}</h3>
                                            <span style="color: #666; font-size: 0.9em;">${exp.startDate} - ${exp.endDate}</span>
                                        </div>
                                        <p style="margin: 0 0 10px 0; color: #667eea; font-weight: 500;">${exp.company}</p>
                                        ${exp.description ? `<div style="color: #555;">${exp.description.split('\n').map(line => `<p style="margin: 5px 0;">${line}</p>`).join('')}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${data.education.filter(edu => edu.degree || edu.institution).length > 0 ? `
                            <div style="margin-bottom: 30px;">
                                <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-bottom: 15px;">Education</h2>
                                ${data.education.filter(edu => edu.degree || edu.institution).map(edu => `
                                    <div style="margin-bottom: 15px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <h3 style="margin: 0; color: #333; font-size: 1.1em;">${edu.degree}</h3>
                                            <span style="color: #666; font-size: 0.9em;">${edu.startYear} - ${edu.endYear}</span>
                                        </div>
                                        <p style="margin: 0; color: #667eea; font-weight: 500;">${edu.institution}</p>
                                        ${edu.gpa ? `<p style="margin: 5px 0 0 0; color: #555;">GPA: ${edu.gpa}</p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${data.skills.length > 0 ? `
                            <div style="margin-bottom: 30px;">
                                <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-bottom: 15px;">Skills</h2>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                    ${data.skills.map(skill => `<span style="background: #e0e7ff; color: #3730a3; padding: 6px 12px; border-radius: 20px; font-size: 0.9em;">${skill}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${data.projects.filter(proj => proj.name).length > 0 ? `
                            <div style="margin-bottom: 30px;">
                                <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-bottom: 15px;">Projects</h2>
                                ${data.projects.filter(proj => proj.name).map(proj => `
                                    <div style="margin-bottom: 20px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                            <h3 style="margin: 0; color: #333; font-size: 1.1em;">${proj.name}</h3>
                                            ${proj.url ? `<a href="${proj.url}" style="color: #667eea; font-size: 0.9em; text-decoration: none;">🔗 View Project</a>` : ''}
                                        </div>
                                        ${proj.tech ? `<p style="margin: 0 0 10px 0; color: #667eea; font-weight: 500;">${proj.tech}</p>` : ''}
                                        ${proj.description ? `<div style="color: #555;">${proj.description.split('\n').map(line => `<p style="margin: 5px 0;">${line}</p>`).join('')}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
}

function generateClassicTemplate(data) {
    return `
                <div style="max-width: 8.5in; margin: 0 auto; background: white; font-family: 'Times New Roman', serif; line-height: 1.6; color: #000;">
                    <!-- Header -->
                    <div style="text-align: center; padding: 30px 30px 20px 30px; border-bottom: 2px solid #000;">
                        <h1 style="margin: 0; font-size: 2.2em; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">${data.firstName} ${data.lastName}</h1>
                        <p style="margin: 10px 0; font-size: 1.1em; font-style: italic;">${data.title}</p>
                        <div style="margin-top: 15px; font-size: 0.9em;">
                            ${data.email ? `${data.email}` : ''} ${data.phone ? ` | ${data.phone}` : ''} ${data.location ? ` | ${data.location}` : ''}
                        </div>
                        <div style="margin-top: 5px; font-size: 0.9em;">
                            ${data.linkedin ? `${data.linkedin}` : ''} ${data.portfolio ? ` | ${data.portfolio}` : ''}
                        </div>
                    </div>
                    
                    <div style="padding: 30px;">
                        ${data.summary ? `
                            <div style="margin-bottom: 25px;">
                                <h2 style="color: #000; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 12px; font-size: 1.2em; text-transform: uppercase;">PROFESSIONAL SUMMARY</h2>
                                <p style="text-align: justify; margin: 0;">${data.summary}</p>
                            </div>
                        ` : ''}
                        
                        ${data.experience.filter(exp => exp.jobTitle || exp.company).length > 0 ? `
                            <div style="margin-bottom: 25px;">
                                <h2 style="color: #000; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 12px; font-size: 1.2em; text-transform: uppercase;">PROFESSIONAL EXPERIENCE</h2>
                                ${data.experience.filter(exp => exp.jobTitle || exp.company).map(exp => `
                                    <div style="margin-bottom: 18px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                            <strong style="font-size: 1.05em;">${exp.jobTitle}</strong>
                                            <span style="font-style: italic;">${exp.startDate} - ${exp.endDate}</span>
                                        </div>
                                        <p style="margin: 0 0 8px 0; font-style: italic;">${exp.company}</p>
                                        ${exp.description ? `<div>${exp.description.split('\n').map(line => `<p style="margin: 3px 0;">${line}</p>`).join('')}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${data.education.filter(edu => edu.degree || edu.institution).length > 0 ? `
                            <div style="margin-bottom: 25px;">
                                <h2 style="color: #000; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 12px; font-size: 1.2em; text-transform: uppercase;">EDUCATION</h2>
                                ${data.education.filter(edu => edu.degree || edu.institution).map(edu => `
                                    <div style="margin-bottom: 12px;">
                                        <div style="display: flex; justify-content: space-between;">
                                            <strong>${edu.degree}</strong>
                                            <span style="font-style: italic;">${edu.startYear} - ${edu.endYear}</span>
                                        </div>
                                        <p style="margin: 0; font-style: italic;">${edu.institution}</p>
                                        ${edu.gpa ? `<p style="margin: 3px 0 0 0;">GPA: ${edu.gpa}</p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${data.skills.length > 0 ? `
                            <div style="margin-bottom: 25px;">
                                <h2 style="color: #000; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 12px; font-size: 1.2em; text-transform: uppercase;">TECHNICAL SKILLS</h2>
                                <p style="margin: 0;">${data.skills.join(' • ')}</p>
                            </div>
                        ` : ''}
                        
                        ${data.projects.filter(proj => proj.name).length > 0 ? `
                            <div style="margin-bottom: 25px;">
                                <h2 style="color: #000; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 12px; font-size: 1.2em; text-transform: uppercase;">PROJECTS</h2>
                                ${data.projects.filter(proj => proj.name).map(proj => `
                                    <div style="margin-bottom: 15px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                            <strong>${proj.name}</strong>
                                            ${proj.url ? `<span style="font-style: italic;">${proj.url}</span>` : ''}
                                        </div>
                                        ${proj.tech ? `<p style="margin: 0 0 5px 0; font-style: italic;">${proj.tech}</p>` : ''}
                                        ${proj.description ? `<div>${proj.description.split('\n').map(line => `<p style="margin: 3px 0;">${line}</p>`).join('')}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
}

function generateCreativeTemplate(data) {
    return `
                <div style="max-width: 8.5in; margin: 0 auto; background: white; font-family: 'Arial', sans-serif; line-height: 1.6; color: #333;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%); color: white; padding: 40px; position: relative; overflow: hidden;">
                        <div style="position: relative; z-index: 2;">
                            <h1 style="margin: 0; font-size: 3em; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${data.firstName} ${data.lastName}</h1>
                            <p style="margin: 15px 0; font-size: 1.3em; opacity: 0.95;">${data.title}</p>
                            <div style="margin-top: 25px; display: flex; flex-wrap: wrap; gap: 20px; font-size: 0.95em;">
                                ${data.email ? `<span style="background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 25px;">📧 ${data.email}</span>` : ''}
                                ${data.phone ? `<span style="background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 25px;">📱 ${data.phone}</span>` : ''}
                                ${data.location ? `<span style="background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 25px;">📍 ${data.location}</span>` : ''}
                            </div>
                        </div>
                        <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%; z-index: 1;"></div>
                    </div>
                    
                    <div style="padding: 35px;">
                        ${data.summary ? `
                            <div style="margin-bottom: 35px; background: linear-gradient(135deg, #f8f9ff 0%, #fff5f5 100%); padding: 25px; border-radius: 15px; border-left: 5px solid #ff6b6b;">
                                <h2 style="color: #ff6b6b; margin-bottom: 15px; font-size: 1.4em; display: flex; align-items: center;"><span style="margin-right: 10px;">✨</span>About Me</h2>
                                <p style="text-align: justify; margin: 0; font-size: 1.05em;">${data.summary}</p>
                            </div>
                        ` : ''}
                        
                        ${data.experience.filter(exp => exp.jobTitle || exp.company).length > 0 ? `
                            <div style="margin-bottom: 35px;">
                                <h2 style="color: #ff6b6b; margin-bottom: 20px; font-size: 1.4em; display: flex; align-items: center;"><span style="margin-right: 10px;">💼</span>Experience</h2>
                                ${data.experience.filter(exp => exp.jobTitle || exp.company).map(exp => `
                                    <div style="margin-bottom: 25px; background: #f8f9ff; padding: 20px; border-radius: 12px; border-left: 4px solid #ffa500;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                            <h3 style="margin: 0; color: #333; font-size: 1.2em;">${exp.jobTitle}</h3>
                                            <span style="background: #ffa500; color: white; padding: 4px 12px; border-radius: 15px; font-size: 0.85em;">${exp.startDate} - ${exp.endDate}</span>
                                        </div>
                                        <p style="margin: 0 0 12px 0; color: #ff6b6b; font-weight: 600; font-size: 1.05em;">${exp.company}</p>
                                        ${exp.description ? `<div style="color: #555;">${exp.description.split('\n').map(line => `<p style="margin: 6px 0;">${line}</p>`).join('')}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                            ${data.education.filter(edu => edu.degree || edu.institution).length > 0 ? `
                                <div>
                                    <h2 style="color: #ff6b6b; margin-bottom: 20px; font-size: 1.4em; display: flex; align-items: center;"><span style="margin-right: 10px;">🎓</span>Education</h2>
                                    ${data.education.filter(edu => edu.degree || edu.institution).map(edu => `
                                        <div style="margin-bottom: 20px; background: #fff5f5; padding: 18px; border-radius: 12px;">
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                                <h3 style="margin: 0; color: #333; font-size: 1.05em;">${edu.degree}</h3>
                                                <span style="color: #666; font-size: 0.9em;">${edu.startYear} - ${edu.endYear}</span>
                                            </div>
                                            <p style="margin: 0; color: #ff6b6b; font-weight: 500;">${edu.institution}</p>
                                            ${edu.gpa ? `<p style="margin: 8px 0 0 0; color: #555; font-size: 0.95em;">GPA: ${edu.gpa}</p>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            ${data.skills.length > 0 ? `
                                <div>
                                    <h2 style="color: #ff6b6b; margin-bottom: 20px; font-size: 1.4em; display: flex; align-items: center;"><span style="margin-right: 10px;">🚀</span>Skills</h2>
                                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                        ${data.skills.map(skill => `<span style="background: linear-gradient(135deg, #ff6b6b, #ffa500); color: white; padding: 8px 16px; border-radius: 25px; font-size: 0.9em; font-weight: 500;">${skill}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        ${data.projects.filter(proj => proj.name).length > 0 ? `
                            <div style="margin-top: 35px;">
                                <h2 style="color: #ff6b6b; margin-bottom: 20px; font-size: 1.4em; display: flex; align-items: center;"><span style="margin-right: 10px;">🛠️</span>Projects</h2>
                                ${data.projects.filter(proj => proj.name).map(proj => `
                                    <div style="margin-bottom: 25px; background: linear-gradient(135deg, #f8f9ff 0%, #fff5f5 100%); padding: 20px; border-radius: 12px; border: 2px solid #ffa500;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                            <h3 style="margin: 0; color: #333; font-size: 1.2em;">${proj.name}</h3>
                                            ${proj.url ? `<a href="${proj.url}" style="color: #ff6b6b; font-size: 0.9em; text-decoration: none; background: rgba(255,107,107,0.1); padding: 6px 12px; border-radius: 15px;">🔗 View</a>` : ''}
                                        </div>
                                        ${proj.tech ? `<p style="margin: 0 0 12px 0; color: #ffa500; font-weight: 600;">${proj.tech}</p>` : ''}
                                        ${proj.description ? `<div style="color: #555;">${proj.description.split('\n').map(line => `<p style="margin: 6px 0;">${line}</p>`).join('')}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
}

function generateMinimalTemplate(data) {
    return `
                <div style="max-width: 8.5in; margin: 0 auto; background: white; font-family: 'Arial', sans-serif; line-height: 1.7; color: #2d3748;">
                    <!-- Header -->
                    <div style="padding: 40px 40px 30px 40px; border-bottom: 1px solid #e2e8f0;">
                        <h1 style="margin: 0; font-size: 2.5em; font-weight: 300; color: #1a202c; letter-spacing: -1px;">${data.firstName} ${data.lastName}</h1>
                        <p style="margin: 8px 0 20px 0; font-size: 1.1em; color: #4a5568; font-weight: 400;">${data.title}</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 25px; font-size: 0.95em; color: #718096;">
                            ${data.email ? `<span>${data.email}</span>` : ''}
                            ${data.phone ? `<span>${data.phone}</span>` : ''}
                            ${data.location ? `<span>${data.location}</span>` : ''}
                            ${data.linkedin ? `<span>${data.linkedin}</span>` : ''}
                            ${data.portfolio ? `<span>${data.portfolio}</span>` : ''}
                        </div>
                    </div>
                    
                    <div style="padding: 40px;">
                        ${data.summary ? `
                            <div style="margin-bottom: 40px;">
                                <h2 style="color: #2d3748; margin-bottom: 15px; font-size: 1.1em; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Summary</h2>
                                <p style="text-align: justify; margin: 0; color: #4a5568; font-size: 1.05em;">${data.summary}</p>
                            </div>
                        ` : ''}
                        
                        ${data.experience.filter(exp => exp.jobTitle || exp.company).length > 0 ? `
                            <div style="margin-bottom: 40px;">
                                <h2 style="color: #2d3748; margin-bottom: 25px; font-size: 1.1em; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Experience</h2>
                                ${data.experience.filter(exp => exp.jobTitle || exp.company).map(exp => `
                                    <div style="margin-bottom: 30px; padding-bottom: 25px; border-bottom: 1px solid #f7fafc;">
                                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                                            <h3 style="margin: 0; color: #1a202c; font-size: 1.15em; font-weight: 500;">${exp.jobTitle}</h3>
                                            <span style="color: #718096; font-size: 0.9em; font-weight: 400;">${exp.startDate} - ${exp.endDate}</span>
                                        </div>
                                        <p style="margin: 0 0 15px 0; color: #4a5568; font-size: 1.05em;">${exp.company}</p>
                                        ${exp.description ? `<div style="color: #4a5568;">${exp.description.split('\n').map(line => `<p style="margin: 8px 0;">${line}</p>`).join('')}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${data.education.filter(edu => edu.degree || edu.institution).length > 0 ? `
                            <div style="margin-bottom: 40px;">
                                <h2 style="color: #2d3748; margin-bottom: 25px; font-size: 1.1em; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Education</h2>
                                ${data.education.filter(edu => edu.degree || edu.institution).map(edu => `
                                    <div style="margin-bottom: 20px;">
                                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                                            <h3 style="margin: 0; color: #1a202c; font-size: 1.1em; font-weight: 500;">${edu.degree}</h3>
                                            <span style="color: #718096; font-size: 0.9em;">${edu.startYear} - ${edu.endYear}</span>
                                        </div>
                                        <p style="margin: 0; color: #4a5568;">${edu.institution}</p>
                                        ${edu.gpa ? `<p style="margin: 5px 0 0 0; color: #718096; font-size: 0.95em;">GPA: ${edu.gpa}</p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${data.skills.length > 0 ? `
                            <div style="margin-bottom: 40px;">
                                <h2 style="color: #2d3748; margin-bottom: 15px; font-size: 1.1em; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Skills</h2>
                                <p style="margin: 0; color: #4a5568; font-size: 1.05em;">${data.skills.join(' • ')}</p>
                            </div>
                        ` : ''}
                        
                        ${data.projects.filter(proj => proj.name).length > 0 ? `
                            <div style="margin-bottom: 40px;">
                                <h2 style="color: #2d3748; margin-bottom: 25px; font-size: 1.1em; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Projects</h2>
                                ${data.projects.filter(proj => proj.name).map(proj => `
                                    <div style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #f7fafc;">
                                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                                            <h3 style="margin: 0; color: #1a202c; font-size: 1.1em; font-weight: 500;">${proj.name}</h3>
                                            ${proj.url ? `<a href="${proj.url}" style="color: #4a5568; font-size: 0.9em; text-decoration: none;">${proj.url}</a>` : ''}
                                        </div>
                                        ${proj.tech ? `<p style="margin: 0 0 10px 0; color: #718096; font-size: 0.95em;">${proj.tech}</p>` : ''}
                                        ${proj.description ? `<div style="color: #4a5568;">${proj.description.split('\n').map(line => `<p style="margin: 8px 0;">${line}</p>`).join('')}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
}

// Zoom functionality
function zoomIn() {
    if (zoomLevel < 1.5) {
        zoomLevel += 0.1;
        updateZoom();
    }
}

function zoomOut() {
    if (zoomLevel > 0.5) {
        zoomLevel -= 0.1;
        updateZoom();
    }
}

function updateZoom() {
    const preview = document.getElementById('resume-preview');
    preview.style.transform = `scale(${zoomLevel})`;
    document.getElementById('zoom-level').textContent = Math.round(zoomLevel * 100) + '%';
}

// Download and sharing functions
function downloadPDF() {
    window.print();
}

function printResume() {
    window.print();
}

function shareResume() {
    if (navigator.share) {
        navigator.share({
            title: 'My Resume',
            text: 'Check out my professional resume',
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('Resume link copied to clipboard!', 'success');
        });
    }
}

// Save and load progress
function saveProgress() {
    const data = collectFormData();
    data.selectedTemplate = selectedTemplate;
    data.skills = skills;
    data.currentStep = currentStep;

    localStorage.setItem('resumeBuilder_progress', JSON.stringify(data));
    showNotification('Progress saved successfully!', 'success');
}

function loadProgress() {
    const saved = localStorage.getItem('resumeBuilder_progress');
    if (saved) {
        const data = JSON.parse(saved);

        // Load basic info
        if (data.firstName) document.getElementById('firstName').value = data.firstName;
        if (data.lastName) document.getElementById('lastName').value = data.lastName;
        if (data.title) document.getElementById('title').value = data.title;
        if (data.email) document.getElementById('email').value = data.email;
        if (data.phone) document.getElementById('phone').value = data.phone;
        if (data.linkedin) document.getElementById('linkedin').value = data.linkedin;
        if (data.portfolio) document.getElementById('portfolio').value = data.portfolio;
        if (data.location) document.getElementById('location').value = data.location;
        if (data.summary) document.getElementById('summary').value = data.summary;

        // Load template
        if (data.selectedTemplate) {
            selectedTemplate = data.selectedTemplate;
            selectTemplate(selectedTemplate);
        }

        // Load skills
        if (data.skills) {
            skills = data.skills;
            displaySkills();
        }

        updatePreview();
        showNotification('Progress loaded successfully!', 'success');
    } else {
        showNotification('No saved progress found', 'info');
    }
}

function startOver() {
    if (confirm('Are you sure you want to start over? This will clear all your current progress.')) {
        location.reload();
    }
}

// Enhanced notification system with modern design
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };

    const gradients = {
        success: 'bg-gradient-to-r from-green-500 to-emerald-600',
        error: 'bg-gradient-to-r from-red-500 to-rose-600',
        info: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-600'
    };

    notification.className = `fixed top-6 right-6 ${gradients[type]} text-white px-6 py-4 rounded-2xl shadow-2xl z-50 transform translate-x-full transition-all duration-500 backdrop-blur-lg border border-white/20`;
    notification.innerHTML = `
                <div class="flex items-center space-x-3">
                    <i class="${icons[type]} text-lg"></i>
                    <span class="font-medium">${message}</span>
                </div>
            `;

    document.body.appendChild(notification);

    // Slide in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 100);

    // Auto dismiss
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        notification.classList.remove('translate-x-0');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 4000);

    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 500);
    });
}

// Initialize
selectTemplate('modern');
updatePreview();


(function () { function c() { var b = a.contentDocument || a.contentWindow.document; if (b) { var d = b.createElement('script'); d.innerHTML = "window.__CF$cv$params={r:'962048cd20e19cd7',t:'MTc1Mjk5MTcxMC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);"; b.getElementsByTagName('head')[0].appendChild(d) } } if (document.body) { var a = document.createElement('iframe'); a.height = 1; a.width = 1; a.style.position = 'absolute'; a.style.top = 0; a.style.left = 0; a.style.border = 'none'; a.style.visibility = 'hidden'; document.body.appendChild(a); if ('loading' !== document.readyState) c(); else if (window.addEventListener) document.addEventListener('DOMContentLoaded', c); else { var e = document.onreadystatechange || function () { }; document.onreadystatechange = function (b) { e(b); 'loading' !== document.readyState && (document.onreadystatechange = e, c()) } } } })();

function downloadPDF() {
    const element = document.getElementById('resume-preview');

    if (!element) {
        alert("Resume preview not found.");
        return;
    }

    const opt = {
        margin: 0.3,
        filename: 'My_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}


function printResume() {
    const printContents = document.getElementById('resume-preview').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    location.reload();  // Optional: refresh page to restore full UI
}

