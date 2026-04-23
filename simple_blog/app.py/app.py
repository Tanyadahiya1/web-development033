# Project: Simple Blog (CRUD)
# Name: Chirag Tanwar
# Date: 2026

from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Temporary storage (no database)
posts = []

# Home Route - Display all posts
@app.route('/')
def index():
    return render_template('index.html', posts=posts)

# Create Post
@app.route('/create', methods=['GET', 'POST'])
def create():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']

        posts.append({'title': title, 'content': content})
        return redirect(url_for('index'))

    return render_template('create.html')

# Edit Post
@app.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit(id):
    post = posts[id]

    if request.method == 'POST':
        post['title'] = request.form['title']
        post['content'] = request.form['content']

        return redirect(url_for('index'))

    return render_template('edit.html', post=post, id=id)

# Delete Post
@app.route('/delete/<int:id>')
def delete(id):
    posts.pop(id)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)