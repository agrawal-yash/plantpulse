document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const fileInput = document.getElementById('file-input');
    const selectFileBtn = document.getElementById('select-file');
    const startAnalysisBtn = document.getElementById('start-analysis');
    const uploadArea = document.getElementById('upload-area');
    const uploadSection = document.getElementById('upload-section');
    const resultSection = document.getElementById('result-section');
    const previewImage = document.getElementById('preview-image');
    const loadingEl = document.getElementById('loading');
    const predictionResult = document.getElementById('prediction-result');
    const healthyResult = document.getElementById('healthy-result');
    const diseaseResult = document.getElementById('disease-result');
    const newAnalysisBtn = document.getElementById('new-analysis');
    const downloadReportBtn = document.getElementById('download-report');
    const debugToggle = document.getElementById('debug-mode');
    const themeToggle = document.getElementById('theme-switch');
    const healthyLabel = document.querySelector('#healthy-label span');
    const diseaseLabel = document.querySelector('#disease-label span');
    const healthyConfidence = document.getElementById('healthy-confidence');
    const diseaseConfidence = document.getElementById('disease-confidence');
    const healthyProgress = document.getElementById('healthy-progress');
    const diseaseProgress = document.getElementById('disease-progress');
    const confidenceContainers = document.querySelectorAll('.confidence-container');
    const diseaseInfo = document.getElementById('disease-info');
    const loadingInfo = document.getElementById('loading-info');
    const infoContent = document.getElementById('info-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const currentPageTitle = document.getElementById('current-page-title');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    // Variables
    let currentFile = null;
    let currentPage = 'home';
    let analysisComplete = false;
    let isAnalyzing = false; // New flag to track active analysis
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';

    // Page Navigation
    function navigateTo(pageId) {
        // Check specifically for results page without data
        if (pageId === 'results' && !analysisComplete && !isAnalyzing) {
            alert("No results available. Please analyze an image first.");
            showNotification('Please upload and analyze an image first', 'error');
            return; // Stop navigation and don't proceed further
        }
        
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            currentPage = pageId;
            currentPageTitle.textContent = targetPage.querySelector('h1').textContent;
            
            // Show/hide result sections based on page and analysis state
            if (pageId === 'results') {
                if (analysisComplete) {
                    loadingEl.style.display = 'none';
                    resultSection.style.display = 'block';
                    predictionResult.style.display = 'block';
                } else if (isAnalyzing) {
                    // If analysis is in progress, show loading state
                    if (loadingEl) loadingEl.style.display = 'block';
                    if (resultSection) resultSection.style.display = 'block';
                    if (predictionResult) predictionResult.style.display = 'none';
                }
            }
            
            // Scroll to top when changing pages
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    // Set up navigation events
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            navigateTo(pageId);
        });
    });
    
    // Start Analysis button
    if (startAnalysisBtn) {
        startAnalysisBtn.addEventListener('click', () => {
            navigateTo('analyzer');
        });
    }
    
    // Tab system
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Accordion functionality
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            // Toggle active class on the clicked item
            item.classList.toggle('active');
        });
    });

    // Event Listeners
    if (selectFileBtn) {
        selectFileBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (uploadArea) {
        uploadArea.addEventListener('click', (e) => {
            if (e.target !== selectFileBtn) {
                fileInput.click();
            }
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFileUpload();
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    if (newAnalysisBtn) {
        newAnalysisBtn.addEventListener('click', resetApp);
    }
    
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', downloadReport);
    }

    // Debug mode toggle with fixed functionality
    if (debugToggle) {
        debugToggle.addEventListener('change', () => {
            localStorage.setItem('debug-mode', debugToggle.checked ? 'on' : 'off');
            toggleDebugMode();
        });
        
        // Restore debug mode state from localStorage
        const debugModeState = localStorage.getItem('debug-mode') === 'on';
        debugToggle.checked = debugModeState;
        toggleDebugMode();
    }
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if(this.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Functions
    function handleFileUpload() {
        if (!fileInput || fileInput.files.length === 0) return;
        
        const file = fileInput.files[0];
        if (!file.type.match('image.*')) {
            showNotification('Please select an image file (jpg, png, etc.)', 'error');
            return;
        }
        
        currentFile = file;
        displayPreview();
        uploadImage();
    }

    function displayPreview() {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewImage) {
                previewImage.src = e.target.result;
                isAnalyzing = true; // Set analyzing flag before navigation
                navigateTo('results');
                if (loadingEl) loadingEl.style.display = 'block';
                if (predictionResult) predictionResult.style.display = 'none';
                if (diseaseInfo) diseaseInfo.style.display = 'none';
                
                const statusEl = document.getElementById('analysis-status');
                if (statusEl) statusEl.textContent = 'Processing...';
                
                const subheading = document.getElementById('results-subheading');
                if (subheading) subheading.textContent = 'Analyzing your plant image...';
            }
        };
        reader.readAsDataURL(currentFile);
    }

    function uploadImage() {
        const formData = new FormData();
        formData.append('file', currentFile);

        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Check if a valid leaf was detected
            if (data.is_valid_leaf === false) {
                showNotification(data.error, 'error');
                resetApp();
                return;
            }
            
            isAnalyzing = false; // Analysis completed
            analysisComplete = true;
            displayResults(data);
            
            const statusEl = document.getElementById('analysis-status');
            if (statusEl) statusEl.textContent = 'Analysis Complete'; // Changed from 'Analysis Complete' to empty string
            
            const subheading = document.getElementById('results-subheading');
            if (subheading) subheading.textContent = data.is_healthy ? 
                'Your plant appears to be healthy' : 'Disease detected in your plant';
            
            // Store results in sessionStorage for persistence between page navigations
            sessionStorage.setItem('analysis-results', JSON.stringify(data));
            
            if (!data.is_healthy) {
                fetchDiseaseInfo(data.label);
            }
        })
        .catch(error => {
            isAnalyzing = false; // Analysis failed
            console.error('Error:', error);
            showNotification('Error analyzing image. Please try again.', 'error');
            resetApp();
        });
    }

    function displayResults(data) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (predictionResult) predictionResult.style.display = 'block';
        
        if (data.is_healthy) {
            if (healthyResult) healthyResult.style.display = 'block';
            if (diseaseResult) diseaseResult.style.display = 'none';
            if (diseaseInfo) diseaseInfo.style.display = 'none';
            if (healthyLabel) healthyLabel.textContent = data.label;
            if (healthyConfidence) healthyConfidence.textContent = data.confidence.toFixed(2);
            if (healthyProgress) healthyProgress.style.width = `${data.confidence}%`;
        } else {
            if (healthyResult) healthyResult.style.display = 'none';
            if (diseaseResult) diseaseResult.style.display = 'block';
            if (diseaseInfo) diseaseInfo.style.display = 'block';
            if (diseaseLabel) diseaseLabel.textContent = data.label;
            if (diseaseConfidence) diseaseConfidence.textContent = data.confidence.toFixed(2);
            if (diseaseProgress) diseaseProgress.style.width = `${data.confidence}%`;
        }
        
        toggleDebugMode();
        analysisComplete = true;
        isAnalyzing = false;
        updateResultsNavVisibility();
    }

    function fetchDiseaseInfo(diseaseName) {
        if (!loadingInfo || !infoContent || !diseaseInfo) return;
        
        loadingInfo.style.display = 'block';
        infoContent.style.display = 'none';
        
        // Check if we have cached disease info
        const cachedInfo = sessionStorage.getItem(`disease-info-${diseaseName}`);
        if (cachedInfo) {
            displayDiseaseInfo(JSON.parse(cachedInfo));
            return;
        }
        
        fetch('/get_disease_info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ disease_name: diseaseName })
        })
        .then(response => response.json())
        .then(data => {
            // Cache the disease info
            sessionStorage.setItem(`disease-info-${diseaseName}`, JSON.stringify(data));
            displayDiseaseInfo(data);
        })
        .catch(error => {
            loadingInfo.style.display = 'none';
            infoContent.style.display = 'block';
            document.getElementById('disease-description').textContent = 'Failed to load disease information. Please try again.';
            console.error('Error:', error);
        });
    }
    
    function displayDiseaseInfo(data) {
        if (!loadingInfo || !infoContent) return;
        
        loadingInfo.style.display = 'none';
        infoContent.style.display = 'block';
        
        if (data.error) {
            document.getElementById('disease-description').textContent = 
                data.mock_data ? data.info.description : 'Error: ' + data.error;
            populateList('disease-causes', data.mock_data ? data.info.causes : []);
            populateList('disease-remedies', data.mock_data ? data.info.remedies : []);
            populateList('disease-prevention', data.mock_data ? data.info.prevention : []);
        } else {
            document.getElementById('disease-description').textContent = data.info.description;
            populateList('disease-causes', data.info.causes);
            populateList('disease-remedies', data.info.remedies);
            populateList('disease-prevention', data.info.prevention);
        }
    }
    
    function populateList(elementId, items) {
        const list = document.getElementById(elementId);
        if (!list) return;
        
        list.innerHTML = '';
        
        if (!items || items.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No information available';
            list.appendChild(li);
            return;
        }
        
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            list.appendChild(li);
        });
    }

    function toggleDebugMode() {
        const isDebugMode = debugToggle ? debugToggle.checked : false;
        
        // Update all debug-dependent UI elements
        document.querySelectorAll('.debug-only').forEach(el => {
            el.style.display = isDebugMode ? 'block' : 'none';
        });
    }

    function resetApp() {
        navigateTo('analyzer');
        if (fileInput) fileInput.value = '';
        currentFile = null;
        analysisComplete = false;
        isAnalyzing = false; // Reset analyzing flag
        
        if (loadingEl) loadingEl.style.display = 'none';
        if (healthyResult) healthyResult.style.display = 'none';
        if (diseaseResult) diseaseResult.style.display = 'none';
        if (diseaseInfo) diseaseInfo.style.display = 'none';
        
        const statusEl = document.getElementById('analysis-status');
        if (statusEl) statusEl.textContent = '';
        
        sessionStorage.removeItem('analysis-results');
        showNotification('Ready for new analysis', 'info');
        updateResultsNavVisibility();
    }
    
    function downloadReport() {
        const reportData = sessionStorage.getItem('analysis-results');
        if (!reportData) {
            showNotification('No analysis data available to download', 'error');
            return;
        }
        
        const data = JSON.parse(reportData);
        const timestamp = new Date().toLocaleString().replace(/[/:]/g, '-');
        
        // Get the uploaded image src
        const imageSource = previewImage ? previewImage.src : '';
        
        // Get healthy tips or disease info
        let resultDetails = '';
        
        if (data.is_healthy) {
            // Add healthy plant tips
            resultDetails = `
            <h2>Maintenance Tips</h2>
            <p>Your plant is healthy! Here are some tips to maintain its health:</p>
            <ul>
                <li>Continue regular watering schedule</li>
                <li>Ensure proper sunlight exposure</li>
                <li>Apply fertilizer as needed</li>
                <li>Monitor for any signs of pests</li>
                <li>Prune occasionally to promote healthy growth</li>
            </ul>
            <h3>Preventive Care</h3>
            <ul>
                <li>Inspect leaves regularly for early signs of issues</li>
                <li>Maintain good air circulation around the plant</li>
                <li>Avoid over-watering which can lead to root rot</li>
                <li>Keep the plant environment clean</li>
            </ul>`;
        } else {
            // Get disease info if available
            const diseaseName = data.label;
            const cachedInfo = sessionStorage.getItem(`disease-info-${diseaseName}`);
            
            if (cachedInfo) {
                const diseaseData = JSON.parse(cachedInfo);
                if (!diseaseData.error && diseaseData.info) {
                    resultDetails = `
                    <h2>Disease Information</h2>
                    <h3>Description</h3>
                    <p>${diseaseData.info.description || 'No description available'}</p>
                    
                    <h3>Causes</h3>
                    <ul>
                        ${(diseaseData.info.causes || []).map(cause => `<li>${cause}</li>`).join('') || '<li>No information available</li>'}
                    </ul>
                    
                    <h3>Remedies</h3>
                    <ul>
                        ${(diseaseData.info.remedies || []).map(remedy => `<li>${remedy}</li>`).join('') || '<li>No information available</li>'}
                    </ul>
                    
                    <h3>Prevention</h3>
                    <ul>
                        ${(diseaseData.info.prevention || []).map(prevention => `<li>${prevention}</li>`).join('') || '<li>No information available</li>'}
                    </ul>`;
                }
            }
        }
        
        // Create HTML report
        const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Plant Health Analysis Report - ${timestamp}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    color: #333;
                }
                h1 {
                    color: #198754;
                    border-bottom: 2px solid #198754;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #198754;
                    margin-top: 20px;
                }
                .report-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .result-box {
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .healthy {
                    background-color: #d1e7dd;
                    border: 1px solid #badbcc;
                }
                .diseased {
                    background-color: #f8d7da;
                    border: 1px solid #f5c2c7;
                }
                .image-container {
                    text-align: center;
                    margin: 20px 0;
                }
                .image-container img {
                    max-width: 100%;
                    max-height: 400px;
                    border-radius: 5px;
                    border: 1px solid #ddd;
                }
                .footer {
                    margin-top: 40px;
                    font-size: 0.8em;
                    text-align: center;
                    color: #6c757d;
                    border-top: 1px solid #dee2e6;
                    padding-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                <h1>Plant Health Analysis Report</h1>
                <p>Generated on: ${timestamp}</p>
            </div>
            
            <div class="image-container">
                <h2>Analyzed Plant Image</h2>
                <img src="${imageSource}" alt="Analyzed Plant Leaf">
            </div>
            
            <h2>Analysis Result</h2>
            <div class="result-box ${data.is_healthy ? 'healthy' : 'diseased'}">
                <h3>${data.is_healthy ? 'Healthy Plant Detected' : 'Disease Detected'}</h3>
                <p><strong>Classification:</strong> ${data.label}</p>
            </div>
            
            ${resultDetails}
            
            <div class="footer">
                <p>Plant Disease Detection System | Made by Yash, Gopika, Shashank, Navya</p>
            </div>
        </body>
        </html>
        `;
        
        // Create a blob from the HTML
        const blob = new Blob([reportHTML], { type: 'text/html' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plant-health-report-${timestamp}.html`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        showNotification('Report downloaded successfully', 'info');
    }
    
    function showNotification(message, type = 'info') {
        const notificationsContainer = document.getElementById('notifications-container') || 
            (() => {
                const container = document.createElement('div');
                container.id = 'notifications-container';
                document.body.appendChild(container);
                return container;
            })();
            
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <p>${message}</p>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        notificationsContainer.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-close after 5 seconds
        const timeout = setTimeout(() => {
            closeNotification(notification);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(timeout);
            closeNotification(notification);
        });
    }
    
    function closeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
    
    // Check for saved analysis results when page loads
    function checkForSavedResults() {
        const savedResults = sessionStorage.getItem('analysis-results');
        if (savedResults) {
            try {
                const data = JSON.parse(savedResults);
                analysisComplete = true;
                
                // If we're on the results page, display the results
                if (currentPage === 'results') {
                    displayResults(data);
                    
                    if (!data.is_healthy) {
                        const cachedInfo = sessionStorage.getItem(`disease-info-${data.label}`);
                        if (cachedInfo) {
                            displayDiseaseInfo(JSON.parse(cachedInfo));
                        } else {
                            fetchDiseaseInfo(data.label);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to parse saved results', e);
                sessionStorage.removeItem('analysis-results');
            }
        }
    }
    
    // Update results nav link visibility based on results availability
    function updateResultsNavVisibility() {
        const resultsNavLink = document.getElementById('results-nav-link');
        if (resultsNavLink) {
            if (analysisComplete || isAnalyzing) {
                resultsNavLink.classList.remove('disabled');
            } else {
                resultsNavLink.classList.add('disabled');
            }
        }
    }

    // Initialize UI
    navigateTo('home');
    checkForSavedResults();
    updateResultsNavVisibility();
});
