const router = require("express").Router();
const { mysqlConnection } = require("../utils/connection");

router.post("/news", async (req, res) => {
  const {
    tweet_id,
    tweet_text,
    tweet_created_at,
    tweet_updated_at,
    tweet_created_by,
  } = req.body;

  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  const insertQuery = `
        INSERT INTO news ( tweet_id, tweet_text, tweet_created_at, tweet_updated_at, tweet_created_by )
        VALUES (?, ?, ?, ?, ? )
    `;

  const values = [
    tweet_id,
    tweet_text,
    unixTimestamp,
    unixTimestamp,
    tweet_created_by,
  ];

  mysqlConnection.query(insertQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error inserting news");
    } else {
      console.log("News inserted successfully", result);
      res.status(200).send("News inserted successfully");
    }
  });
});

router.patch("/news/:newsId", (req, res) => {
  const newsId = req.params.newsId;
  const {
    tweet_id,
    tweet_text,
    tweet_created_at,
    tweet_updated_at,
    tweet_created_by,
  } = req.body;

  const selectQuery = `
        SELECT * FROM news WHERE id = ?
    `;
  const selectValues = [newsId];
  const date = new Date();
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  mysqlConnection.query(
    selectQuery,
    selectValues,
    function (error, selectResult) {
      if (error) {
        console.log(error);
        res.status(500).send("Error fetching news data");
      } else {
        if (selectResult.length === 0) {
          res.status(404).send("News not found");
        } else {
          const existingData = selectResult[0];

          let updateQuery = `UPDATE news SET `;
          const values = [];

          const updateField = (field, value) => {
            if (value !== undefined) {
              updateQuery += `${field} = ?, `;
              values.push(value);
            }
          };
          updateField("tweet_id", tweet_id);
          updateField("tweet_text", tweet_text);
          updateField("tweet_updated_at", unixTimestamp);
          updateField("tweet_created_by", tweet_created_by);

          updateQuery = updateQuery.slice(0, -2);

          updateQuery += " WHERE id = ?";
          values.push(newsId);

          mysqlConnection.query(
            updateQuery,
            values,
            function (error, updateResult) {
              if (error) {
                console.log(error);
                res.status(500).send("Error updating news");
              } else {
                if (updateResult.affectedRows === 0) {
                  res.status(404).send("news not found");
                } else {
                  res.status(200).send("news updated successfully");
                }
              }
            }
          );
        }
      }
    }
  );
});

router.delete("/news/:newsId", (req, res) => {
  const newsId = req.params.newsId;

  const deleteQuery = `
        DELETE FROM news
        WHERE id = ?
    `;
  const values = [newsId];

  mysqlConnection.query(deleteQuery, values, function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Error deleting news");
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send("News not found");
      } else {
        console.log("News deleted successfully");
        res.status(200).send("News deleted successfully");
      }
    }
  });
});

router.get("/news", (req, res) => {
  const selectQuery = `
        SELECT * FROM news
    `;

  mysqlConnection.query(selectQuery, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching news");
    } else {
      res.status(200).json(results);
    }
  });
});

router.get("/news/:newsId", (req, res) => {
  const newsId = req.params.newsId;
  const selectQuery = `
        SELECT * FROM news WHERE id = ?
    `;
  const values = [newsId];

  mysqlConnection.query(selectQuery, values, function (error, results) {
    if (error) {
      console.log(error);
      res.status(500).send("Error fetching news");
    } else {
      if (results.length === 0) {
        res.status(404).send("News not found");
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
});

module.exports = router;
