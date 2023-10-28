import ForgeUI, { render, Table, Head, Heading, Row, Cell, SpacePage, Fragment, useProductContext, useState, Text } from '@forge/ui';
import api, { route } from "@forge/api";

const fetchPropertiesForSpace = async (spaceKey) => {
  const response = await api.asUser().requestConfluence(route`/wiki/rest/api/space/${spaceKey}/property`);
  const data = await response.json();
  return data.results;
};

const fetchSpace = async (spaceKey) => {
  const response = await api.asUser().requestConfluence(route`/wiki/rest/api/space/${spaceKey}?expand=history`);
  const data = await response.json();
  return data;
};

const isAdmin = async () => {
  const response = await api.asUser().requestConfluence(route`/wiki/rest/api/user/current?expand=operations`);
  const data = await response.json();
  let result = false;
  const priveleges = data["operations"];
  if (priveleges.length == undefined) {
    result = true;
    return result;
  };
  for (let i = 0; i < priveleges.length; i++) {
    let current = priveleges[i];
    if (current["operation"] == "administer") {
      result = true;
      return result
    }
  };
  return result;
};


const App = () => {
  const { spaceKey } = useProductContext();
  const [properties] = useState(async () => await fetchPropertiesForSpace(spaceKey));
  const spaceQuery = useState(async () => await fetchSpace(spaceKey))
  const {id} = spaceQuery[0];
  const {createdDate} = spaceQuery[0].history;
  const originalDate = new Date(createdDate);
  const formattedDate = `${(originalDate.getMonth() + 1).toString().padStart(2, '0')}-${originalDate.getDate().toString().padStart(2, '0')}-${originalDate.getFullYear()}`;
  const adminCall = useState(async () => await isAdmin())
  const userIsAdmin = adminCall[0]

  console.log("Formatted Date is: " + formattedDate);
  console.log("Is Admin = " + userIsAdmin)




  if(isAdmin == true) {
    return (
      <SpacePage>
        <Fragment>
          <Heading size="large">Space Properties</Heading>
            <Table>
              <Head>
                <Cell>
                  <Text>Key</Text>
                </Cell>
                <Cell>
                <Text>Value</Text>
                </Cell>
              </Head>
              {properties.map(property => (
                <Row>
                  <Cell>
                    <Text>{property.key}</Text>
                  </Cell>
                  <Cell>
                    <Text>{property.value}</Text>
                  </Cell>
                </Row>
              ))}
            </Table>
        </Fragment>
        <Fragment>
          <Heading size="large">Space Details</Heading>
          <Table>
              <Head>
                <Cell>
                  <Text>Key</Text>
                </Cell>
                <Cell>
                <Text>Value</Text>
                </Cell>
              </Head>
                <Row>
                  <Cell>
                    <Text>Space ID</Text>
                  </Cell>
                  <Cell>
                    <Text>{id}</Text>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <Text>Created Date</Text>
                  </Cell>
                  <Cell>
                    <Text>{formattedDate}</Text>
                  </Cell>
                </Row>
            </Table>
        </Fragment>
      </SpacePage>
    );
  } else{
    return (
      <SpacePage>
        <Fragment>
          <Text>You need to be an admin to see this page!</Text>
        </Fragment>
      </SpacePage>
    )
  }
}

export const run = render(
  <App />
);