# az-math-content-manager
# 🚀 Quick Start - Az-Math Content System

## 📦 Files to Upload (Copy-Paste to GitHub)

### 1. Root Files
```
✅ index.html
✅ README.md
```

### 2. Shared Resources
```
✅ shared/css/base.css
✅ shared/css/math.css
✅ shared/js/firebase-config.js
```

### 3. Editor Files
```
✅ editor/index.html
✅ editor/css/editor.css
✅ editor/js/math-tool.js
✅ editor/js/image-wrapper-tool.js
✅ editor/js/editor-setup.js
✅ editor/js/editor-actions.js
```

---

## 🎯 Upload Steps

### Option 1: GitHub Web Interface (Easiest)

1. **Go to your GitHub repository**

2. **Create folders and upload files:**

   ```
   Click "Add file" → "Upload files"
   ```

3. **For each file:**
   - Create folder structure by typing: `shared/css/base.css`
   - GitHub auto-creates folders
   - Paste content from artifacts
   - Commit

4. **Enable GitHub Pages:**
   - Settings → Pages
   - Source: `main` branch, `/ (root)`
   - Save
   - Visit: `https://yourusername.github.io/repo-name/`

### Option 2: Direct File Creation

1. **Create new file:**
   ```
   Click "Add file" → "Create new file"
   ```

2. **Enter path with filename:**
   ```
   shared/css/base.css
   ```

3. **Paste content**

4. **Commit changes**

5. **Repeat for all files**

---

## ✅ Verification Checklist

After uploading, verify your repository has this structure:

```
your-repo/
├── ✅ index.html
├── ✅ README.md
├── shared/
│   ├── css/
│   │   ├── ✅ base.css
│   │   └── ✅ math.css
│   └── js/
│       └── ✅ firebase-config.js
└── editor/
    ├── ✅ index.html
    ├── css/
    │   └── ✅ editor.css
    └── js/
        ├── ✅ math-tool.js
        ├── ✅ image-wrapper-tool.js
        ├── ✅ editor-setup.js
        └── ✅ editor-actions.js
```

---

## 🧪 Testing

### 1. Open Your Site
```
https://yourusername.github.io/your-repo/
```

### 2. Click "Rich Editor"
Should open: `https://yourusername.github.io/your-repo/editor/`

### 3. Test Features

**✅ Metadata:**
- Enter title
- Select category
- Choose difficulty
- Add tags

**✅ Content:**
- Type text
- Click `+` to add blocks
- Try `/` for quick commands

**✅ Math:**
- Click `+` → Math
- Enter: `x^2 + y^2 = r^2`
- Toggle inline/display
- Check preview

**✅ Image:**
- Click `+` → Image
- Upload test image
- Try float-left wrapping
- Add caption

**✅ Solutions:**
- Click "Add Solution"
- Enter title
- Add content
- Try multiple solutions

**✅ Actions:**
- Preview content
- Save draft
- Publish

---

## 🔥 Common Issues

### ❌ "Firebase not defined"
**Fix:** Check `firebase-config.js` is uploaded correctly

### ❌ "Editor.js not loading"
**Fix:** Check internet connection (CDN dependency)

### ❌ Math not rendering
**Fix:** Wait 2-3 seconds for MathJax to load

### ❌ Images not uploading
**Fix:** Check Firebase Storage rules in Firebase Console

### ❌ 404 Page Not Found
**Fix:** 
- Wait 5 minutes after enabling GitHub Pages
- Check file paths are exactly as shown
- Ensure `index.html` is in root

---

## 🎨 Quick Customization

### Change Colors

Edit `shared/css/base.css`:

```css
:root {
  --primary: #2563eb;        /* Your brand color */
  --primary-dark: #1d4ed8;
  --primary-light: #60a5fa;
}
```

### Change Site Name

Edit `index.html` and `editor/index.html`:

```html
<title>Your Site Name</title>
<h1>🎓 Your Site Name</h1>
```

---

## 📱 Mobile Testing

1. Open on phone
2. Should be fully responsive
3. Test touch interactions
4. Upload image from camera

---

## 🎯 Next Steps

### Immediate:
1. ✅ Upload all files
2. ✅ Enable GitHub Pages
3. ✅ Test editor
4. ✅ Create first problem

### Coming Soon:
- 📚 Viewer pages (display problems/lessons)
- 📝 LaTeX uploader
- 🔍 Search functionality
- 👤 User authentication

---

## 💡 Pro Tips

### Content Creation:
- Write in markdown first, then format
- Use math sparingly for readability
- Float small images, center large ones
- Preview often

### Organization:
- Use consistent naming for categories
- Tag thoroughly for search
- Add solution steps clearly
- Keep difficulty accurate

### Performance:
- Optimize images before upload
- Use external URLs for large files
- Save drafts frequently
- Clear browser cache if slow

---

## 📞 Need Help?

### Check:
1. Browser console (F12) for errors
2. Network tab for failed requests
3. Firebase console for backend issues
4. README.md for detailed docs

### Debug:
- Open browser DevTools (F12)
- Check Console tab
- Look for red errors
- Copy error message

---

## ✨ Success!

If you can:
- ✅ See the landing page
- ✅ Open the editor
- ✅ Add math equations
- ✅ Upload images
- ✅ Save/publish content

**🎉 You're all set!**

Now start creating amazing math content! 🎓

---

**Questions? Check README.md for full documentation.**
