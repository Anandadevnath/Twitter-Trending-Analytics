function About() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Documentation &amp; Specifications</h1>
        <p className="page-subtitle">Architecture overview, methodology, data provenance, and evaluation metrics</p>
      </div>

      <div className="about-content">
        <h2>Project Title</h2>
        <p>Twitter Trending Hashtag Analytics and Classification Using Machine Learning</p>

        <h2>Problem Statement</h2>
        <p>
          Twitter/X surfaces thousands of viral hashtags daily, but raw trending metadata lacks standardized topic categorizations. This makes it difficult for researchers, digital marketers, and analysts to aggregate trends by domain (Politics, Sports, Tech, etc.) or gauge viral momentum programmatically.
        </p>

        <h2>Objectives</h2>
        <ul>
          <li>Ingest and clean 12,036 historical trending records (2020–2025).</li>
          <li>Establish categorical ground-truth labels using explainable rule-based heuristics.</li>
          <li>Train an explainable Random Forest classifier utilizing TF-IDF text features and numerical engagement metrics.</li>
          <li>Expose a high-performance FastAPI microservice for serialized inference.</li>
          <li>Deliver an interactive MERN dashboard with paginated filtering, search, and deep-dive analytics.</li>
        </ul>

        <h2>Dataset Provenance</h2>
        <p>
          Source dataset obtained from <a href="https://huggingface.co/datasets/ronantakizawa/twitter-trending-hashtags" target="_blank" rel="noreferrer" style={{color:'#0070f3'}}>Hugging Face (ronantakizawa/twitter-trending-hashtags)</a>. Contains 12,036 rows across 5 raw features: <code>tag</code>, <code>year</code>, <code>peak_date</code>, <code>tweets</code>, and <code>rank</code>.
        </p>

        <h2>Rule-Based Category Ground Truth</h2>
        <p>
          The original dataset does not contain topic classifications. Categories (Politics, Sports, Entertainment, Technology, Holiday, Social, Other) were generated through a deterministic rule-based keyword mapping process for training purposes.
        </p>

        <h2>Trending Level Virality Thresholds</h2>
        <p>
          Trending levels are project-defined engagement thresholds (not official Twitter/X standards):
        </p>
        <ul>
          <li><strong>Low:</strong> &lt; 100,000 tweets</li>
          <li><strong>Medium:</strong> 100,000 to &lt; 1,000,000 tweets</li>
          <li><strong>High:</strong> 1,000,000 to &lt; 10,000,000 tweets</li>
          <li><strong>Viral:</strong> &ge; 10,000,000 tweets</li>
        </ul>

        <h2>Machine Learning Pipeline</h2>
        <ul>
          <li><strong>Model:</strong> <code>RandomForestClassifier(n_estimators=100, random_state=42)</code></li>
          <li><strong>Feature Engineering:</strong> TF-IDF Vectorizer (500 text unigrams/n-grams) + metadata (tweet count, rank, tag length, word count, temporal features).</li>
          <li><strong>Split:</strong> 80% Training (9,628 rows) / 20% Testing (2,408 rows) stratified split.</li>
          <li><strong>Validation Accuracy:</strong> <strong>90.61%</strong> (Weighted F1: 87.49%).</li>
        </ul>

        <h2>Full-Stack System Architecture</h2>
        <p>
          Hugging Face CSV &rarr; Pandas Preprocessing &rarr; Feature Engineering &rarr; Random Forest ML (<code>model.pkl</code>) &rarr; FastAPI (:8000) &rarr; Express.js (:5000) &rarr; MongoDB Atlas &rarr; React/Vite Dashboard (:3000).
        </p>
      </div>
    </div>
  )
}

export default About
