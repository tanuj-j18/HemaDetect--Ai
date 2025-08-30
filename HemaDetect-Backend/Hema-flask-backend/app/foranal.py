import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

# Data
data = {
    'Algorithm': [
        'Region Splitting',
        'Region Growing',
        'K-Means Clustering',
        'Fuzzy C-Means (FCM)'
    ],
    'DICE Score': [0.6103, 0.6814, 0.7216, 0.7659]
}

# Create DataFrame
df = pd.DataFrame(data)

# Set the plot style
sns.set(style="whitegrid")

# Create the bar plot
plt.figure(figsize=(10, 6))
barplot = sns.barplot(x='DICE Score', y='Algorithm', data=df, palette='viridis')

# Add score labels to each bar
for i, score in enumerate(df['DICE Score']):
    barplot.text(score + 0.01, i, f'{score:.4f}', color='black', va="center", fontweight='bold')

# Title and labels
plt.title('DICE Scores Across Classical Algorithms', fontsize=16, fontweight='bold')
plt.xlabel('DICE Score')
plt.ylabel('Segmentation Algorithm')
plt.xlim(0.5, 0.85)

# Make layout tight and show
plt.tight_layout()
plt.show()
