INSERT INTO views VALUES(
  $(id),
  $(user_id),
  $(video_url),
  $(video_id),
  $(platform_id),
  ${platform_type},
  CURRENT_TIMESTAMP
) RETURNING *
