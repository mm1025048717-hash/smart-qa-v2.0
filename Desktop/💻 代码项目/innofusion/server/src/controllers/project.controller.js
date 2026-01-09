import Project from '../models/project.model.js';

// @desc    Get user projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  const { name, data } = req.body;

  if (!data) {
    return res.status(400).json({ message: 'Project data is required' });
  }

  try {
    const project = new Project({
      name: name || 'Untitled Project',
      data,
      user: req.user.id,
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project && project.user.toString() === req.user.id) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  const { name, data } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (project && project.user.toString() === req.user.id) {
      project.name = name || project.name;
      project.data = data || project.data;

      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project && project.user.toString() === req.user.id) {
      await project.remove();
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
