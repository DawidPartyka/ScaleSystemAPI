# ScaleSystemAPI
## Not particularly state of the art atm 

API with a little bit of frontend storing and altering scales while also offering access to jamtracks, streaming of those and more. It uses authorization from Auth0 with express-openid-connect, DB in Postgres, Sequelize as ORM and Express.

What's there?
  - Scales
  -- Public and private ones
  -- Finding possible scales by few sounds
  -- Possibility to count views through ScaleViews table 
  -- Shifting scales to different tonics
  - Jamtracks
  -- Described by Artists (m:n), Genre, Scales(m:n), bpm, server file locations, duration, file size, file extension 
  -- Scales related to jamtracks contain timestamps creating a possibility to dynamically display scales on a virtual fretboard to fit certain moments in the song ( https://localhost:8000/user/playFretboard/:jamtrackId endpoint in case of standard configuration )
  - Management panel
  -- Basically logs, overview of interactions, their amount, user amount and lists of data by http codes the api returned to clients

What's not there?
- [ ] Changing jamtrack file location on it's genre update and updating db record due to the change
- [ ] Making the virtual fretboard more "interactive"
- [ ] General code refactor (spaghetti cooking school more often than not)
- [ ] Anything else that will pop up later ¯\\_(ツ)_/¯
