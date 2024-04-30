FROM node:14-alpine AS development

ENV NODE_ENV=development

# Set the default working directory for the app
# It is a best practice to use the /usr/src/app directory
WORKDIR /usr/src/app
# Copy package.json, package-lock.json
# Copying this separately prevents re-running npm install on every code change.
COPY yarn.lock package.json ./
# Install dependencies.
RUN yarn install --development 
# Bundle app source
COPY . .
RUN yarn build

# deps image - install production only node modules
FROM node:14-alpine AS deps
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set the user to use when running this image
# Non previlage mode for better security (this user comes with official NodeJS image).
# USER node
# Set the default working directory for the app
# It is a best practice to use the /usr/src/app directory
WORKDIR /deps
# Copy package.json, package-lock.json
# Copying this separately prevents re-running npm install on every code change.
COPY yarn.lock package.json ./
# Install dependencies.
RUN yarn install --production 


# production image - copy dist & production node_modules from above steps (optimize build size)
FROM node:14-alpine AS production

COPY --from=development /usr/src/app/dist /dist
COPY --from=deps /deps /

ENTRYPOINT ["node", "dist/main"]
