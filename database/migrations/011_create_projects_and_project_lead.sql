-- Migration 011: Create projects table and project members with Project Lead architecture

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  key VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  lead_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'lead' or 'member'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_project_member UNIQUE (project_id, user_id)
);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_proj ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- Initialize default project for existing tasks
DO $$
DECLARE
  first_lead_id BIGINT;
  default_proj_id BIGINT;
BEGIN
  -- Prefer an employee or first user as lead
  SELECT id INTO first_lead_id FROM users WHERE role = 'employee' ORDER BY id ASC LIMIT 1;
  IF first_lead_id IS NULL THEN
    SELECT id INTO first_lead_id FROM users ORDER BY id ASC LIMIT 1;
  END IF;

  IF first_lead_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM projects WHERE key = 'TF') THEN
      INSERT INTO projects (name, key, description, lead_id)
      VALUES ('TaskFlow Cloud', 'TF', 'Main Cloud Computing Workspace', first_lead_id)
      RETURNING id INTO default_proj_id;

      INSERT INTO project_members (project_id, user_id, role)
      VALUES (default_proj_id, first_lead_id, 'lead')
      ON CONFLICT DO NOTHING;

      INSERT INTO project_members (project_id, user_id, role)
      SELECT default_proj_id, u.id, CASE WHEN u.id = first_lead_id THEN 'lead' ELSE 'member' END
      FROM users u
      ON CONFLICT DO NOTHING;

      UPDATE tasks SET project_id = default_proj_id WHERE project_id IS NULL;
    END IF;
  END IF;
END $$;
