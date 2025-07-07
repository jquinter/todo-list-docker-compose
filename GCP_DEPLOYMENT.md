## How to Set Up
Follow these steps to connect your repository and activate the build trigger.

# 1. Add the cloudbuild.yaml to Your Repository
Commit the cloudbuild.yaml file above to the root of your /home/jquinter/todo-list-docker-compose repository and push it to GitHub.

# 2. Set Up the Google Cloud Build Trigger
1. Navigate to the **Cloud Build -> Triggers** page in your Google Cloud project.

2. If you haven't already, click **Connect repository** and select your GitHub repository.

3. Click **Create trigger**.
    * Name: Give your trigger a descriptive name (e.g., `release-on-tag-push`).
    * Event: Select **Push new tag**.
    * Source: Choose your newly connected GitHub repository.
    * Tag (regex): Enter `v.*` to trigger on tags that start with "v" (like v1.0.0), or .* to trigger on any tag. Using a prefix like v is a common best practice for versioning.
    * Configuration: Select **Cloud Build configuration file (yaml or json)**. The default location (`/cloudbuild.yaml`) is correct.
    * Substitution variables: This is where you'll set the production URL for your frontend.
        1. Click **+ Add variable**.
        2. Variable: `_VUE_APP_API_URL`
        3. Value: `https://your-actual-production-api.com/api` (replace with your real backend URL).
4. Click **Create** to save the trigger.

# 3. Trigger the Build
Now, you're all set! To trigger the pipeline, create a new tag on a commit and push it to GitHub.

bash
# 1. Make sure your code changes are committed
git commit -am "feat: Prepare for v1.0.0 release"

# 2. Create a new tag
git tag v1.0.0

# 3. Push the tag to your remote repository on GitHub
git push origin v1.0.0
Pushing this tag will automatically start a new build in Google Cloud Build. If all steps succeed, you will find your new Docker images (todo-frontend:v1.0.0, todo-backend:v1.0.0, and the :latest versions) in your project's Google Container Registry