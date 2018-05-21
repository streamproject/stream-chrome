INSERT INTO Upvotes VALUES(
  $(id),
  $(user_id),
  $(video_id),
  $(platform_id),
  ${platform_type},
  ${upvoted},
  CURRENT_TIMESTAMP
) RETURNING *
