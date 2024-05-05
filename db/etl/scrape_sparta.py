from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

urls = [
    'https://sparta.aerospace.org/countermeasures/references/SI-2',
]


def sparta_link(url):
    return urljoin("https://sparta.aerospace.org", url)


def get_relevant_countermeasures(soup):
    countermeasures = []
    # Find the h2 tag by its content
    header = soup.find('h2', text='Countermeasures Covered by Control')

    # Check if the header is found
    if header:
        # Find the next <ul> element immediately following the <h2>
        table = header.find_next_sibling('table')

        # Check if the ul is found
        if table:
            print("Found CM table")
            cols = list(map(lambda x: x.text, table.find_all('thead')[0].find_all('tr')[0].find_all('td')))
            print ('found cols')
            for row in table.find_all('tr', class_='technique'):
                row_data = {}
                for i, cell in enumerate(row.find_all('td')):
                    col = cols[i]
                    if col == "ID":
                        row_data[col] = sparta_link(cell.find('a')['href'])
                    elif col == "D3FEND":
                        row_data[col] = list(map(lambda a: sparta_link(a['href']), cell.find_all('a')))
                        pass
                    else:
                        row_data[col] = cell.text
                countermeasures.append(row_data)
        else:
            print("No CM table found!")
    else:
        print("no relevant countermeasure found")
    return countermeasures


def get_informational_references(soup):
    links = []
    # Find the h2 tag by its content
    header = soup.find('h2', text='Informational References')

    # Check if the header is found
    if header:
        # Find the next <ul> element immediately following the <h2>
        ul_list = header.find_next_sibling('ul')

        # Check if the ul is found
        if ul_list:
            print("Found UL list:")
            for li in ul_list.find_all('li'):
                print(li.text.strip())
                if li.a:
                    print(f"Link: {li.a['href']}")  # Prints the href attribute of the <a> tag
                    links.append(li.a['href'])
                else:
                    print(f"No link found for info resources")
        else:
            print("No UL list found after the specified header.")
    else:
        print("Header not found.")

    # seems to only ever exist for ISO-27001 resources
    header = soup.find('h2', id='datasources')
    if header:
        # Find the next <ul> element immediately following the <h2>
        ul_list = header.find_next_sibling('ul')

        # Check if the ul is found
        if ul_list:
            print("Found UL list:")
            for li in ul_list.find_all('li'):
                print(li.text.strip())
                if li.a:
                    print(f"Link: {li.a['href']}")  # Prints the href attribute of the <a> tag
                    links.append(sparta_link(li.a['href']))
                else:
                    print(f"No link found for info resources")
        else:
            print("No UL list found after the specified header.")
    else:
        print("Header not found.")
    return links


def fetch_data(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        soup = BeautifulSoup(response.text, 'html.parser')

        control_text = soup.find('div', class_='description-body').text.strip()
        info_resources = get_informational_references(soup)
        info_resources.append(url)

        relevant_countermeasures = get_relevant_countermeasures(soup)

        control_data = {
            "control_text": control_text,
            "info_resources": info_resources,
            "relevant_countermeasures": relevant_countermeasures
        }
        return control_data
    except requests.RequestException as e:
        return str(e)


# Loop through the URLs and print the extracted data
if __name__ == "__main__":
    for url in urls:
        data = fetch_data(url)
        print(f"Data from {url}: {data}")