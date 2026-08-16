function About() {
  return (
    <div className="page">
      <h1 className="page-title">About This Project</h1>
      <div className="about-content">
        <h2>Project Title</h2>
        <p>Twitter Trending Hashtag Analytics and Classification Using Machine Learning</p>

        <h2>Problem Statement</h2>
        <p>
          Twitter/X generates thousands of trending hashtags daily, but there is no built-in system to
          automatically categorize them. This project aims to classify trending hashtags into meaningful
          categories using Machine Learning techniques.
        </p>

        <h2>Objectives</h2>
        <ul>
          <li>Analyze Twitter trending hashtag data from Hugging Face</li>
          <li>Clean and preprocess the dataset</li>
          <li>Create meaningful categories using rule-based labeling</li>
          <li>Train a Random Forest classifier to predict hashtag categories</li>
          <li>Build a full-stack web application for data visualization and prediction</li>
        </ul>

        <h2>Dataset</h2>
        <p>
          Source: <a href="https://huggingface.co/datasets/ronantakizawa/twitter-trending-hashtags" target="_blank" rel="noreferrer" style={{color:'#1da1f2'}}>
            Hugging Face - ronantakizawa/twitter-trending-hashtags
          </a>
        </p>
        <p>Approximately 12,036 rows with columns: tag, year, peak_date, tweets, rank</p>

        <h2>Category Labels</h2>
        <p><strong>Important:</strong> The categories (Politics, Sports, Entertainment, Technology, Holiday, Social, Other)
          were created using a <strong>rule-based keyword matching approach</strong>. These labels are NOT part of the
          original dataset. They were engineered for this project's ML training purposes.</p>

        <h2>Trending Levels</h2>
        <p><strong>Important:</strong> The trending levels (Low, Medium, High, Viral) are <strong>project-defined
          thresholds</strong> based on tweet counts. They are NOT official Twitter/X classifications.</p>
        <ul>
          <li><strong>Low:</strong> &lt; 100,000 tweets</li>
          <li><strong>Medium:</strong> 100,000 to &lt; 1,000,000 tweets</li>
          <li><strong>High:</strong> 1,000,000 to &lt; 10,000,000 tweets</li>
          <li><strong>Viral:</strong> 10,000,000+ tweets</li>
        </ul>

        <h2>Machine Learning</h2>
        <ul>
          <li><strong>Algorithm:</strong> Random Forest Classifier (scikit-learn)</li>
          <li><strong>Features:</strong> TF-IDF on hashtag text + numerical features (tweets, rank, tag_length, word_count, month, day_of_week, year)</li>
          <li><strong>Split:</strong> 80% training / 20% testing</li>
          <li><strong>Evaluation:</strong> Accuracy, Precision, Recall, F1-Score, Confusion Matrix</li>
        </ul>

        <h2>Tech Stack</h2>
        <ul>
          <li><strong>ML:</strong> Python, Pandas, NumPy, Matplotlib, Scikit-learn</li>
          <li><strong>ML API:</strong> FastAPI</li>
          <li><strong>Backend:</strong> Node.js, Express.js, MongoDB</li>
          <li><strong>Frontend:</strong> React, Recharts</li>
        </ul>

        <h2>Architecture</h2>
        <p>
          Hugging Face Dataset → Python/Pandas → Data Cleaning → Feature Engineering →
          Random Forest ML → Saved Model → FastAPI → Node/Express → MongoDB → React Dashboard
        </p>
      </div>
    </div>
  )
}

export default About
