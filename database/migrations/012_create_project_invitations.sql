-- Migration 012: Create project invitations table for team membership requests

CREATE TABLE IF NOT EXISTS project_invitations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  inviter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_project_invitations_invitee ON project_invitations(invitee_id, status);
CREATE INDEX IF NOT EXISTS idx_project_invitations_project ON project_invitations(project_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_pending_invitation ON project_invitations(project_id, invitee_id) WHERE status = 'pending';
